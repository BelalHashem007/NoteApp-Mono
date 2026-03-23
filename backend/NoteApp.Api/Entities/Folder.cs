namespace NoteApp.Api.Entities
{
    public class Folder
    {
        public Guid Id { get; set; }
        public string FolderName { get; set; }
        public List<Note> Notes { get; set; }
        public DateTime CreatedAt { get; set; }

        public ApplicationUser User { get; set; }
        public string UserId { get; set; }
    }
}
