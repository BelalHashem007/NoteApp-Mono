using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IFolderRepository
    {
        public Task<List<Folder>> GetFolders(string userId);
        public Task<Folder?> GetFolder(string userId, Guid id);
        public Task<Folder> CreateFolder( Folder folder);
        public Task UpdateFolder(Folder folderToUpdate);
        public Task DeleteFolder(string userid, Guid id);
    }
}
