namespace NoteApp.Api.Entities.DTOs
{
    public class NoteViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Body { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateNoteViewModel
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
    }

    public class CreateNoteViewModel
    {
        public required string Title { get; set; }
        public string? Body { get; set; }
    }
}
