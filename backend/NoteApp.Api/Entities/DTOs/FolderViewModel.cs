using System.ComponentModel.DataAnnotations;

namespace NoteApp.Api.Entities.DTOs
{
    public class FolderViewModel
    {
        public Guid Id { get; set; }
        public string FolderName { get; set; }

        public string UserId { get; set; }
    }

    public class UpdateFolderViewModel
    {
        [MaxLength(50)]
        public required string FolderName { get; set; }
    }
    public class CreateFolderViewModel
    {
        public required string FolderName { get; set; }
    }
}
