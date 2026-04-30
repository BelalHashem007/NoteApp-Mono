namespace NoteApp.Api.Entities
{
    public class NotesToTags
    {
        public Guid NotesId { get; set; }
        public int TagsId { get; set; }

        public Note Note { get; set; }
        public Tag Tag { get; set; }
    }
}
