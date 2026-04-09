using Microsoft.AspNetCore.Identity;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IAuthService
    {
        public Task<AuthViewModel> Login (LoginViewModel dto);
        public Task<AuthViewModel> Register (RegisterViewModel dto);
        public Task<AuthViewModel> RefreshToken(string token);

        public Task<LoginExternalViewModel> GoogleLogin(ExternalLoginInfo? info);

    }
}
