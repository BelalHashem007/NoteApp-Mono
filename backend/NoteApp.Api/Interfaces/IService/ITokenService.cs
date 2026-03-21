using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IService
{
    public interface ITokenService
    {
        public string GenerateToken(ApplicationUser user, IList<string>? roles);
    }
}
