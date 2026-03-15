using NoteApp.Api.Entities;

namespace NoteApp.Api.Repositories
{
    public interface IFolderRepository
    {
        public Task<List<Folder>> GetFolders();
        public Task<Folder?> GetFolder(Guid id);
        public Task<Folder> CreateFolder(Folder folder);
        public Task UpdateFolder(Folder folderToUpdate);
        public Task DeleteFolder(Guid id);
    }
}
