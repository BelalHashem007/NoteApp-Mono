using System.ComponentModel.DataAnnotations;

namespace NoteApp.Api.Entities.DTOs
{
    public class LoginViewModel
    {
        [Required, StringLength(256, MinimumLength = 2)]
        public required string Email { get; set; }

        [Required, StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
    }
}
