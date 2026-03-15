namespace NoteApp.Api.DTOs
{
    public class CreateNoteDto
    {
        public required string Title { get; set; }
        public string? Body { get; set; }
    }
}
