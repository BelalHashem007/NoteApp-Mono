using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IRepositories;
using System.Linq.Expressions;

namespace NoteApp.Api.Repositories
{
    public class AuthRepository(UserManager<ApplicationUser> _userManager) : IAuthRepository
    {
        public async Task<IdentityResult> CreateApplicationUser(ApplicationUser user, string password)
        {
            var result = await _userManager.CreateAsync(user, password);
            return result;
        }

        public async Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, dto.Password))
                return user;
            else return null;
        }

        public async Task<bool> FindUserByEmail(string email)
        {
            if (await _userManager.FindByEmailAsync(email) is not null)
                return true;

            return false;
        }

        public async Task<bool> FindUserByUserName(string userName)
        {
            if (await _userManager.FindByNameAsync(userName) is not null)
                return true;

            return false;
        }

        public async Task<IdentityResult> AddDefaultRole(ApplicationUser user, string role)
        {
            var result = await _userManager.AddToRoleAsync(user, role);
            return result;
        }

        public async Task<IList<string>> GetUserRoles(ApplicationUser user)
        {
            return (await _userManager.GetRolesAsync(user)).ToList();
        }

        public async Task UpdateUser(ApplicationUser user)
        {
            await _userManager.UpdateAsync(user);
        }

        public async Task<ApplicationUser?> FindUser(Expression<Func<ApplicationUser, bool>> expression)
        {
            return await _userManager.Users.SingleOrDefaultAsync(expression);
        }
    }
}
