using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IAuthService
    {
        public Task Signup(SignupDto dto);
        public Task<string?> Login (LoginDto dto);
    }
}
