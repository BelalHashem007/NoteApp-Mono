namespace NoteApp.Api.Entities
{
    public class Note
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Guid FolderId { get; set; }
        public Folder Folder { get; set; }
    }
}
