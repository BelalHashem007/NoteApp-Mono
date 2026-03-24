using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class AuthService(IAuthRepository authRepository, ITokenService tokenService, ILogger<AuthService> logger) : IAuthService
    {
        public async Task<ResponseViewModel<AuthViewModel>> Login(LoginViewModel dto)
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
                };

                if (user.RefreshTokens.Any(t => t.IsActive))
                {
                    var activeRefreshToken = user.RefreshTokens.FirstOrDefault(t => t.IsActive);
                    authViewModel.RefreshToken = activeRefreshToken.Token;
                    authViewModel.RefreshTokenExpiration = activeRefreshToken.ExpiresOn;
                }
                else
                {
                    var refreshToken = tokenService.GenerateRefreshToken();
                    authViewModel.RefreshToken = refreshToken.Token;
                    authViewModel.RefreshTokenExpiration = refreshToken.ExpiresOn;
                    user.RefreshTokens.Add(refreshToken);
                    await authRepository.UpdateUser(user);
                }

                return new ResponseViewModel<AuthViewModel>
                {
                    Success = true,
                    Message = "Login Successful",
                    Data = authViewModel
                };
            }
            else
            {
                throw new UnauthorizedException("Invalid credentials");
            }
        }

        public async Task<ResponseViewModel<AuthViewModel>> Register(RegisterViewModel dto)
        {
            // Validation and checking duplication
            var validator = new RegisterViewModelValidator();
            var validationResult = validator.Validate(dto);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.ToString());

            if (await authRepository.FindUserByEmail(dto.Email))
                throw new UserAlreadyExistsException("Email is already taken");

            var username = dto.Email.Substring(0, dto.Email.IndexOf("@"));

            if (await authRepository.FindUserByUserName(username))
                throw new UserAlreadyExistsException("Username is already taken");

            // Creating user
            var user = new ApplicationUser
            {
                Email = dto.Email,
                FullName = dto.FullName,
                UserName = username
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
            };

            var refreshToken = tokenService.GenerateRefreshToken();
            authViewModel.RefreshToken = refreshToken.Token;
            authViewModel.RefreshTokenExpiration = refreshToken.ExpiresOn;
            user.RefreshTokens.Add(refreshToken);
            await authRepository.UpdateUser(user);

            return new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Message = "Register Successful",
                Data = authViewModel
            };
        }

        public async Task<ResponseViewModel<AuthViewModel>> RefreshToken(string token)
        {
            var user = await authRepository.FindUser(u => u.RefreshTokens.Any(t => t.Token == token));
            if (user == null)
                throw new NotFoundException("Invalid refresh token");

            var refreshToken = user.RefreshTokens.FirstOrDefault(t => t.Token == token);

            if (!refreshToken.IsActive)
                throw new NotFoundException("Invalid refresh token");

            var userRoles = await authRepository.GetUserRoles(user);
            refreshToken.RevokedOn = DateTime.UtcNow;

            var newRefreshToken = tokenService.GenerateRefreshToken();
            var accessToken = tokenService.GenerateJwtToken(user, userRoles);

            user.RefreshTokens.Add(newRefreshToken);

            await authRepository.UpdateUser(user);

            var userViewModel = ObjectMapperHelper.Map<ApplicationUser, ApplicationUserViewModel>(user);
            userViewModel.Roles = userRoles;

            return new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Data = new AuthViewModel
                {
                    User = userViewModel,
                    AccessToken = accessToken,
                    RefreshToken = newRefreshToken.Token,
                    RefreshTokenExpiration = newRefreshToken.ExpiresOn
                }
            };
        }
    }
}
