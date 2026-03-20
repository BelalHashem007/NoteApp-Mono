using Microsoft.AspNetCore.Identity;

namespace NoteApp.Api.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
    }
}
