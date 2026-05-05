using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class UnitOfWork(
        IFolderRepository folders,
        INoteRepository notes,
        IBaseRepository<Attachment> attachments,
        IBaseRepository<Tag> tags,
        IBaseRepository<NotesToTags> notesToTages,
        IBaseRepository<ApplicationUser> users,
        AppDbContext context) : IUnitOfWork
    {
        public IFolderRepository Folders => folders;

        public IBaseRepository<Attachment> Attachments => attachments;
        public IBaseRepository<Tag> Tags => tags;
        public IBaseRepository<NotesToTags> NotesToTages => notesToTages;
        public IBaseRepository<ApplicationUser> Users => users;

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
