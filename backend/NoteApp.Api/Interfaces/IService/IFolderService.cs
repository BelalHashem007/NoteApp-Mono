using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IFolderService
    {
        public Task<IEnumerable<FolderViewModel>> GetFolders(string userid, CancellationToken ct);
        public Task<FolderViewModel> GetFolder(string userid, Guid id, CancellationToken ct);
        public Task<FolderViewModel> CreateFolder(string userid, CreateFolderViewModel dto, CancellationToken ct);
        public Task<FolderViewModel> UpdateFolder(string userid, Guid id, UpdateFolderViewModel dto, CancellationToken ct);
        public Task DeleteFolder(string userid, Guid id, CancellationToken ct);
        public Task<FoldersAndNotesViewModel> GetAllFolderItems(string userId, Guid id);
    }
}
