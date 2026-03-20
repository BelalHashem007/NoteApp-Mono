using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces
{
    public interface IFolderService
    {
        public Task<List<Folder>> GetFolders();
        public Task<Folder> GetFolder(Guid id);
        public Task<Folder> CreateFolder(CreateFolderDto dto);
        public Task<Folder> UpdateFolder(Guid id, UpdateFolderDto dto);
        public Task DeleteFolder(Guid id);
    }
}
