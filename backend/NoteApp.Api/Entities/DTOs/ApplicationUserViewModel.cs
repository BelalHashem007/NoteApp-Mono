namespace NoteApp.Api.Entities.DTOs
{
    public class ApplicationUserViewModel
    {
        public required string Id { get; set; }
        public required string Email { get; set; }
        public required string UserName { get; set; }
        public required string FullName { get; set; }
        public required IList<string> Roles { get; set; }
    }
}
