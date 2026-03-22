using Microsoft.AspNetCore.Identity;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class AuthRepository(UserManager<ApplicationUser> _userManager) : IAuthRepository
    {
        public async Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, dto.Password))
                return user;
            else return null;
        }
    }
}
