using NoteApp.Api.Exceptions;
using System.Security.Claims;

namespace NoteApp.Api.Extensions
{
    public static class ClaimsPrincipalExtension
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedException("User Id Not found in token");
        }
    }
}
