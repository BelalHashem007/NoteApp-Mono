namespace NoteApp.Api.Entities.DTOs
{
    public class FoldersAndNotesViewModel
    {
        public Guid Id { get; set; }
        public string FolderName { get; set; }
        public List<NoteWithoutBodyViewModel> Notes { get; set; } = [];
        public DateTime CreatedAt { get; set; }
        public List<FoldersAndNotesViewModel> SubFolders { get; set; } = [];
        public Guid? ParentId { get; set;  }
    }
}
