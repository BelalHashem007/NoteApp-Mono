using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IService
{
    public interface ITokenService
    {
        public string GenerateJwtToken(ApplicationUser user, IList<string>? roles);
        public RefreshToken GenerateRefreshToken();
    }
}
