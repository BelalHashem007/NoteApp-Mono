using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IAuthService
    {
        public Task<AuthViewModel> Login (LoginViewModel dto);
        public Task<AuthViewModel> Register (RegisterViewModel dto);
        public Task<AuthViewModel> RefreshToken(string token);

    }
}
