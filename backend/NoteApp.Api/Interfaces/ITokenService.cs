using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces
{
    public interface ITokenService
    {
        public string GenerateToken(ApplicationUser user, IList<string>? roles);
    }
}
