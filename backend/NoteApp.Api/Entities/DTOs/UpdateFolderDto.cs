using System.ComponentModel.DataAnnotations;

namespace NoteApp.Api.Entities.DTOs
{
    public class UpdateFolderDto
    {
        [MaxLength(50)]
        public required string FolderName { get; set; }
    }
}
