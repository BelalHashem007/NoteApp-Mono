using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class UnitOfWork(IBaseRepository<Folder> folders, INoteRepository notes, AppDbContext context) : IUnitOfWork
    {
        public IBaseRepository<Folder> Folders => folders;

        public INoteRepository Notes => notes;

        public async Task<int> Complete(CancellationToken ct = default)
        {
            return await context.SaveChangesAsync(ct);
        }

        public void Dispose()
        {
            context.Dispose();
        }
    }
}
