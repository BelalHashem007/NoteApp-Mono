using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class FolderRepository(AppDbContext dbContext) : IFolderRepository
    {
        public async Task<Folder> CreateFolder( Folder folder)
        {
            dbContext.Folders.Add(folder);
            await dbContext.SaveChangesAsync();
            return folder;
        }

        public async Task DeleteFolder(string userid, Guid id)
        {
           var folder = await dbContext.Folders.FirstOrDefaultAsync(x=> x.UserId == userid && x.Id == id);
            if (folder == null)
                return;

            dbContext.Folders.Remove(folder);
            await dbContext.SaveChangesAsync();
        }

        public async Task<Folder?> GetFolder(string userId, Guid id)
        {
            var folder = await dbContext.Folders.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == id);
            return folder;
        }

        public async Task<List<Folder>> GetFolders(string userId)
        {
            return await dbContext.Folders.Where(x=> x.UserId == userId).ToListAsync();
        }

        public async Task UpdateFolder(Folder folderToUpdate)
        {
            await dbContext.SaveChangesAsync();
        }
    }
}
