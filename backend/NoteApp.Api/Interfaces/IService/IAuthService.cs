using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IAuthService
    {
        public Task<ResponseViewModel<AuthViewModel>> Login (LoginViewModel dto);
        public Task<ResponseViewModel<AuthViewModel>> Register (RegisterViewModel dto);
        public Task<ResponseViewModel<AuthViewModel>> RefreshToken(string token);

    }
}
