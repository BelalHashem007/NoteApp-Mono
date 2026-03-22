using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IFolderService
    {
        public Task<IEnumerable<Folder>> GetFolders(string userid);
        public Task<Folder> GetFolder(string userid, Guid id);
        public Task<Folder> CreateFolder(string userid, CreateFolderDto dto);
        public Task<Folder> UpdateFolder(string userid, Guid id, UpdateFolderDto dto);
        public Task DeleteFolder(string userid, Guid id);
    }
}
