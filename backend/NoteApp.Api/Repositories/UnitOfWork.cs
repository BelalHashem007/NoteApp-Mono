using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class UnitOfWork(IBaseRepository<Folder> folders, IBaseRepository<Note> notes, AppDbContext context) : IUnitOfWork
    {
        public IBaseRepository<Folder> Folders => folders;

        public IBaseRepository<Note> Notes => notes;

        public async Task<int> Complete()
        {
            return await context.SaveChangesAsync();
        }

        public void Dispose()
        {
            context.Dispose();
        }
    }
}
