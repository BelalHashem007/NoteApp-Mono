namespace NoteApp.Api.Entities
{
    public class Attachment
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public Guid? NoteId { get; set; }
        public string StoragePath { get; set; }
        public string OriginalName { get; set; }
        public string MimeType { get; set; }
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        public Note? Note { get; set; }
    }
}
