using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class UnitOfWork(IFolderRepository folders, INoteRepository notes, IBaseRepository<Attachment> attachments, AppDbContext context) : IUnitOfWork
    {
        public IFolderRepository Folders => folders;

        public IBaseRepository<Attachment> Attachments => attachments;

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
