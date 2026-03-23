using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class AuthService(IAuthRepository authRepository, ITokenService tokenService) : IAuthService
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
               // var userRoles = await userManager.GetRolesAsync(user);
                var accessToken = tokenService.GenerateToken(user,null);
                return new ResponseViewModel<AuthViewModel>
                {
                    Success = true,
                    Message = "Login Successful",
                    Data = new AuthViewModel
                    {
                        Success = true,
                        AccessToken = accessToken
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

            var user = new ApplicationUser
            {
                Email = dto.Email,
                FullName = dto.FullName,
                UserName = dto.Email.Substring(0 ,dto.Email.IndexOf("@"))
            };

            var identityResult = await authRepository.CreateApplicationUser(user, dto.Password);
            if (!identityResult.Succeeded)
                throw new Exception("Failed to create user in the database");

            var accessToken = tokenService.GenerateToken(user, null);
            return new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Message = "Register Successful",
                Data = new AuthViewModel
                {
                    Success = true,
                    AccessToken = accessToken
                }
            };

        }
    }
}
