using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Repositories
{
    public class FolderRepository(AppDbContext dbContext) : IFolderRepository
    {
        public async Task<Folder> CreateFolder(Folder folder)
        {
            dbContext.Folders.Add(folder);
            await dbContext.SaveChangesAsync();
            return folder;
        }

        public async Task DeleteFolder(Guid id)
        {
           var folder = await dbContext.Folders.FindAsync(id);
            if (folder == null)
                return;

            dbContext.Folders.Remove(folder);
            await dbContext.SaveChangesAsync();
        }

        public async Task<Folder?> GetFolder(Guid id)
        {
            var folder = await dbContext.Folders.FindAsync(id);
            return folder;
        }

        public async Task<List<Folder>> GetFolders()
        {
            return await dbContext.Folders.ToListAsync();
        }

        public async Task UpdateFolder(Folder folderToUpdate)
        {
            await dbContext.SaveChangesAsync();
        }
    }
}
