using Microsoft.AspNetCore.Identity;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IAuthRepository
    {
        public Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto);
        public Task<IdentityResult> CreateApplicationUser(ApplicationUser user, string password);
    }
}
