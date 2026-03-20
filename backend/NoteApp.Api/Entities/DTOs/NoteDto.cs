namespace NoteApp.Api.Entities.DTOs
{
    public class NoteDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Body { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
