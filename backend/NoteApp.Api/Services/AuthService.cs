using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using NoteApp.Api.Configuration;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace NoteApp.Api.Services
{
    public class AuthService(
        IAuthRepository authRepository,
        IOptions<JwtOptions> jwtOptions,
        ITokenService tokenService,
        ILogger<AuthService> logger,
        IMemoryCache _cache) : IAuthService
    {
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

        public async Task<AuthViewModel> Login(LoginViewModel dto)
        {
            //Validation
            var validator = new LoginViewModelValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var user = await authRepository.GetApplicationUser(dto);
            if (user != null)
            {
                //Generating jwt token and refresh token
                var userRoles = await authRepository.GetUserRoles(user);
                var accessToken = tokenService.GenerateJwtToken(user , userRoles);

                var userViewModel = new ApplicationUserViewModel
                {
                    Email = user.Email,
                    FullName = user.FullName,
                    Id = user.Id,
                    UserName = user.UserName,
                    Roles = userRoles
                };

                var authViewModel = new AuthViewModel
                {
                    User = userViewModel,
                    AccessToken = accessToken,
                    AccessTokenExpirationDate = DateTime.UtcNow.AddMinutes(jwtOptions.Value.LifeTime)
                };
                var activeRefreshTokens = await authRepository.GetActiveRefreshTokens(user.Id);
                if (activeRefreshTokens.Count > 0)
                {
                    var activeRefreshToken = activeRefreshTokens[0];
                    authViewModel.RefreshToken = activeRefreshToken.Token;
                    authViewModel.RefreshTokenExpiration = activeRefreshToken.ExpiresOn;
                }
                else
                {
                    var refreshToken = tokenService.GenerateRefreshToken();
                    refreshToken.UserId = user.Id;
                    authViewModel.RefreshToken = refreshToken.Token;
                    authViewModel.RefreshTokenExpiration = refreshToken.ExpiresOn;
                    await authRepository.AddRefreshToken(refreshToken);
                }

                return authViewModel;
            }
            else
            {
                throw new UnauthorizedException("Invalid credentials");
            }
        }

        public async Task<AuthViewModel> Register(RegisterViewModel dto)
        {
            // Validation and checking duplication
            var validator = new RegisterViewModelValidator();
            var validationResult = validator.Validate(dto);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.ToString());

            if (await authRepository.UserExistByEmail(dto.Email))
                throw new UserAlreadyExistsException("Email is already taken");

            // Creating user
            var user = new ApplicationUser
            {
                Email = dto.Email,
                FullName = dto.FullName,
                UserName = dto.Email,
                RefreshTokens = []
            };

            var identityResult = await authRepository.CreateApplicationUser(user, dto.Password);
            if (!identityResult.Succeeded)
            {
                var errorDescriptors = string.Join("\n", identityResult.Errors.Select(x => x.Description));
                throw new Exception($"Tried to add user with email {user.Email}, but failed with errors: ${errorDescriptors}");
            }

            var roleResult = await authRepository.AddDefaultRole(user, UserRoles.User);
            if (!roleResult.Succeeded)
                logger.LogError($"Failed to create role `User` for user with email {user.Email}");

            // Generating Jwt Token and RefreshToken
            var accessToken = tokenService.GenerateJwtToken(user, roleResult.Succeeded ? [UserRoles.User] : null);

            var userViewModel = new ApplicationUserViewModel
            {
                Email = user.Email,
                FullName = user.FullName,
                Id = user.Id,
                UserName = user.UserName,
                Roles = roleResult.Succeeded ? [UserRoles.User] : []
            };

            var authViewModel = new AuthViewModel 
            {
                User = userViewModel,
                AccessToken = accessToken,
                AccessTokenExpirationDate = DateTime.UtcNow.AddMinutes(jwtOptions.Value.LifeTime)
            };

            var refreshToken = tokenService.GenerateRefreshToken();
            refreshToken.UserId = user.Id;

            authViewModel.RefreshToken = refreshToken.Token;
            authViewModel.RefreshTokenExpiration = refreshToken.ExpiresOn;

           await authRepository.AddRefreshToken(refreshToken);

            return authViewModel;
        }

        public async Task<AuthViewModel> RefreshToken(string token, CancellationToken ct)
        {
            Console.WriteLine($"Request came with token {token}");
            var cacheKey = token;

            if (_cache.TryGetValue(cacheKey, out AuthViewModel cached))
            {
                Console.WriteLine($"Request hit the first cache");
                return cached;
            }

            var semaphore = _locks.GetOrAdd(token, _ => new SemaphoreSlim(1, 1));

            await semaphore.WaitAsync();

            try
            {
                if (_cache.TryGetValue(cacheKey, out cached))
                {
                    Console.WriteLine($"Request hit the second cache");
                    return cached;
                }

                var refreshToken = await authRepository.FindRefreshTokenIncludingUser(token, ct);
                if (refreshToken == null || refreshToken.User == null)
                    throw new NotFoundException("Invalid refresh token");

                var user = refreshToken.User;
                var userRoles = await authRepository.GetUserRoles(user);
                refreshToken.RevokedOn = DateTime.UtcNow;

                var newRefreshToken = tokenService.GenerateRefreshToken();
                newRefreshToken.UserId = user.Id;
                var accessToken = tokenService.GenerateJwtToken(user, userRoles);

                await authRepository.AddRefreshToken(newRefreshToken);

                var userViewModel = ObjectMapperHelper.Map<ApplicationUser, ApplicationUserViewModel>(user);
                userViewModel.Roles = userRoles;

                var result = new AuthViewModel
                {
                        User = userViewModel,
                        AccessToken = accessToken,
                        RefreshToken = newRefreshToken.Token,
                        RefreshTokenExpiration = newRefreshToken.ExpiresOn,
                        AccessTokenExpirationDate = DateTime.UtcNow.AddMinutes(jwtOptions.Value.LifeTime)
                };

                _cache.Set(cacheKey, result, TimeSpan.FromSeconds(10));

                return result;
            }
            finally
            {
                semaphore.Release();
                _locks.TryRemove(token, out _);
            }
        }

        public async Task<LoginExternalViewModel> GoogleLogin(ExternalLoginInfo? info)
        {
            if (info == null)
                throw new ExternalLoginFailedException("Failed to extract ExternalLoginInfo");

            logger.LogInformation("Retrieved ExternalLoginInfo");
            var principal = info.Principal;
            var email = principal.FindFirstValue(ClaimTypes.Email) ?? 
                throw new ExternalLoginFailedException("Failed to extract email from ExternalLoginInfo");
            var firstName = principal.FindFirstValue(ClaimTypes.GivenName);
            var lastName = principal.FindFirstValue(ClaimTypes.Surname);

            var user = await authRepository.FindLoginExternal(info.LoginProvider, info.ProviderKey);
            logger.LogInformation("Email is {email}",email);

            if (user == null)
            {

                user = await authRepository.FindUserByEmail(email);

                if (user == null)
                {
                    //create new user
                    user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = $"{firstName ?? ""} {lastName ?? ""}".Trim(),
                    };

                    var accountRegisterationResult = await authRepository.CreateApplicationUser(user);
                    if (!accountRegisterationResult.Succeeded)
                        throw new ExternalLoginFailedException(string.Join(", ", accountRegisterationResult.Errors.Select(x => x.Description)));

                    var roleResult = await authRepository.AddDefaultRole(user, UserRoles.User);
                    if (!roleResult.Succeeded)
                        logger.LogError($"Failed to create role `User` for user with email {user.Email}");
                }

                //add loginExternal to db
                var providerInfo = new UserLoginInfo(info.LoginProvider, info.ProviderKey, info.ProviderDisplayName);
                var loginExternalResult = await authRepository.AddLoginExternal(user, providerInfo);
                if (!loginExternalResult.Succeeded && !loginExternalResult.Errors.Any(e => e.Description.Contains("already exists")))
                     throw new ExternalLoginFailedException(string.Join(", ", loginExternalResult.Errors.Select(x => x.Description)));
            }

            //login
            //if user has active refresh token, return it with new access token, else generate new refresh token and return
            var activeRefreshTokens = await authRepository.GetActiveRefreshTokens(user.Id);
            if (activeRefreshTokens.Count > 0)
            {
                var activeRefreshToken = activeRefreshTokens[0];
                return new LoginExternalViewModel
                {
                    AccessToken = tokenService.GenerateJwtToken(user, await authRepository.GetUserRoles(user)),
                    AccessTokenExpiresOn = DateTime.UtcNow.AddMinutes(30).ToString("O"),
                    RefreshToken = activeRefreshToken.Token,
                    RefreshTokenExpiresOn = activeRefreshToken.ExpiresOn.ToString("O")
                };
            }

            var refreshToken = tokenService.GenerateRefreshToken();
            refreshToken.UserId = user.Id;
            await authRepository.AddRefreshToken(refreshToken);
            await authRepository.UpdateUser(user);
            var userRoles = await authRepository.GetUserRoles(user);

            var accessToken = tokenService.GenerateJwtToken(user, userRoles);

            return new LoginExternalViewModel
            {
                AccessToken = accessToken,
                AccessTokenExpiresOn = DateTime.UtcNow.AddMinutes(30).ToString("O"),
                RefreshToken = refreshToken.Token,
                RefreshTokenExpiresOn = refreshToken.ExpiresOn.ToString("O")
            };
        }
    }
}
