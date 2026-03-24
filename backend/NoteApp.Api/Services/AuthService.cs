using Microsoft.Extensions.Options;
using NoteApp.Api.Configuration;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class AuthService(IAuthRepository authRepository, ITokenService tokenService, IOptions<JwtOptions> jwtOptions, ILogger<AuthService> logger) : IAuthService
    {
        public async Task<ResponseViewModel<AuthViewModel>> Login(LoginViewModel dto)
        {
            var validator = new LoginViewModelValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(result.ToString());

            var user = await authRepository.GetApplicationUser(dto);
            if (user != null)
            {
                var userRoles = await authRepository.GetUserRoles(user);
                var accessToken = tokenService.GenerateToken(user,null);

                var userViewModel = new ApplicationUserViewModel
                {
                    Email = user.Email,
                    FullName = user.FullName,
                    Id = user.Id,
                    UserName = user.UserName,
                    Roles = userRoles
                };

                return new ResponseViewModel<AuthViewModel>
                {
                    Success = true,
                    Message = "Login Successful",
                    Data = new AuthViewModel
                    {
                        AccessToken = accessToken,
                        User = userViewModel,
                        ExpiresOn = DateTime.UtcNow.AddMinutes(jwtOptions.Value.LifeTime)
                    }
                };
            }
            else
            {
                throw new UnauthorizedException("Invalid credentials");
            }
        }

        public async Task<ResponseViewModel<AuthViewModel>> Register(RegisterViewModel dto)
        {
            var validator = new RegisterViewModelValidator();
            var validationResult = validator.Validate(dto);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.ToString());

            if (await authRepository.FindUserByEmail(dto.Email))
                throw new UserAlreadyExistsException("Email is already taken");

            var username = dto.Email.Substring(0, dto.Email.IndexOf("@"));

            if (await authRepository.FindUserByEmail(username))
                throw new UserAlreadyExistsException("Username is already taken");

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

            var accessToken = tokenService.GenerateToken(user, null);
            var userViewModel = new ApplicationUserViewModel
            {
                Email = user.Email,
                FullName = user.FullName,
                Id = user.Id,
                UserName = user.UserName,
                Roles = roleResult.Succeeded ? [UserRoles.User] : []
            };

            return new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Message = "Register Successful",
                Data = new AuthViewModel
                {
                    AccessToken = accessToken,
                    User = userViewModel,
                    ExpiresOn = DateTime.UtcNow.AddMinutes(jwtOptions.Value.LifeTime)
                }
            };

        }
    }
}
