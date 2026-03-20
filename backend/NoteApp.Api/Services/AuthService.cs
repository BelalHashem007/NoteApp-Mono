using Microsoft.AspNetCore.Identity;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces;

namespace NoteApp.Api.Services
{
    public class AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService) : IAuthService
    {
        public async Task<string?> Login(LoginDto dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email);
            if (user != null && await userManager.CheckPasswordAsync(user, dto.Password))
            {
                var userRoles = await userManager.GetRolesAsync(user);
                var accessToken = tokenService.GenerateToken(user, userRoles);
                return accessToken;
            }
            else
            {
                return null;
            }
        }

        public async Task Signup(SignupDto dto)
        {
            var user = new ApplicationUser
            {
                FullName = dto.FullName,
                UserName = dto.Email[..(dto.Email.IndexOf('@'))],
                Email = dto.Email
            };

            var result = await userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new ValidationException(result.ToString());
        }
    }
}
