using Microsoft.AspNetCore.Identity;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IAuthRepository
    {
        public Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto);
        public Task<IdentityResult> CreateApplicationUser(ApplicationUser user, string password);
        public Task<bool> FindUserByEmail(string email);
        public Task<bool> FindUserByUserName(string userName);
        Task<IdentityResult> AddDefaultRole(ApplicationUser user, string role);
        public Task<IList<string>> GetUserRoles(ApplicationUser user);
    }
}
