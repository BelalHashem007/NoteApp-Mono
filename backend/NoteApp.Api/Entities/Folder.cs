namespace NoteApp.Api.Entities
{
    public class Folder
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<Note> Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
