namespace NoteApp.Api.Entities
{
    public class Tag
    {
        public int Id { get; set; }
        /*Name size is 100*/
        public string Name { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public List<Note> Notes { get; set; }
    }
}
