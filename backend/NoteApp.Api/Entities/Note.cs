namespace NoteApp.Api.Entities
{
    public class Note
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Body { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Slug { get; set; }

        public Guid FolderId { get; set; }
        public Folder Folder { get; set; }
        public ApplicationUser User { get; set; }
        public string UserId { get; set; }
        public List<Attachment> Attachments { get; set; }
    }
}
