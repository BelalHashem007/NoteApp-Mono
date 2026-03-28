using Microsoft.AspNetCore.Identity;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using System.Linq.Expressions;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IAuthRepository
    {
        public Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto);
        public Task<IdentityResult> CreateApplicationUser(ApplicationUser user, string? password = null);
        public Task<bool> UserExistByEmail(string email);
        public Task<ApplicationUser?> FindUserByEmail(string email);
        public Task<bool> FindUserByUserName(string userName);
        Task<IdentityResult> AddDefaultRole(ApplicationUser user, string role);
        public Task<IList<string>> GetUserRoles(ApplicationUser user);
        public Task UpdateUser(ApplicationUser user);
        public Task<ApplicationUser?> FindUser(Expression<Func<ApplicationUser, bool>> expression);
        public Task<IdentityResult> AddLoginExternal(ApplicationUser user, UserLoginInfo info);
        public Task<ApplicationUser?> FindLoginExternal(string loginProvider, string providerKey);
    }
}
