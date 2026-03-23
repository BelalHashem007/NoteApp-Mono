using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IFolderService
    {
        public Task<ResponseViewModel<IEnumerable<FolderViewModel>>> GetFolders(string userid);
        public Task<ResponseViewModel<FolderViewModel>> GetFolder(string userid, Guid id);
        public Task<ResponseViewModel<FolderViewModel>> CreateFolder(string userid, CreateFolderViewModel dto);
        public Task<ResponseViewModel<FolderViewModel>> UpdateFolder(string userid, Guid id, UpdateFolderViewModel dto);
        public Task DeleteFolder(string userid, Guid id);
    }
}
