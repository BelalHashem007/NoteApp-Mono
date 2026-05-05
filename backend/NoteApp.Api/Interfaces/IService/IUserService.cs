using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IUserService
    {
        public Task<ApplicationUserViewModel> GetUser(string userId, CancellationToken ct);
    }
}
