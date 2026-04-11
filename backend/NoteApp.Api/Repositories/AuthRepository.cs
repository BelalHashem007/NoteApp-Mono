using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IRepositories;
using System.Linq.Expressions;

namespace NoteApp.Api.Repositories
{
    public class AuthRepository(UserManager<ApplicationUser> _userManager, AppDbContext _context) : IAuthRepository
    {
        public async Task<IdentityResult> CreateApplicationUser(ApplicationUser user, string? password = null)
        {
            var result = 
                password != null ? 
                await _userManager.CreateAsync(user, password) : 
                await _userManager.CreateAsync(user);
            return result;
        }
        public async Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, dto.Password))
                return user;
            else return null;
        }

        public async Task<bool> UserExistByEmail(string email)
        {
            if (await _userManager.FindByEmailAsync(email) is not null)
                return true;
            return false;
        }
        public async Task<ApplicationUser?> FindUserByEmail(string email)
        {
            return await _userManager.FindByEmailAsync(email);
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

        public async Task<IdentityResult> AddLoginExternal(ApplicationUser user, UserLoginInfo info)
        {
              return await _userManager.AddLoginAsync(user, info);
        }

        public async Task<ApplicationUser?> FindLoginExternal(string loginProvider, string providerKey)
        {
            return await _userManager.FindByLoginAsync(loginProvider, providerKey);
        }

        public async Task AddRefreshToken(RefreshToken refreshToken)
        {
            await _context.Set<RefreshToken>().AddAsync(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> FindRefreshTokenIncludingUser(string refreshToken, CancellationToken ct)
        {
            return await _context.Set<RefreshToken>().Include(x => x.User).FirstOrDefaultAsync( t=> t.Token == refreshToken && t.RevokedOn == null );
        }

        public async Task<List<RefreshToken>> GetActiveRefreshTokens(string userId)
        {
            return await _context.Set<RefreshToken>().Where(x => x.UserId == userId && x.RevokedOn == null).ToListAsync();
        }
    }
}
