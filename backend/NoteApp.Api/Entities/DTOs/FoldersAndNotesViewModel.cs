namespace NoteApp.Api.Entities.DTOs
{
    public class FoldersAndNotesViewModel
    {
        public List<FolderViewModel> Folders { get; set; }
        public List<NoteViewModel> Notes { get; set; }
    }
}
