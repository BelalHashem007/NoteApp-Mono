using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IAuthRepository
    {
        public Task<ApplicationUser?> GetApplicationUser(LoginViewModel dto);
    }
}
