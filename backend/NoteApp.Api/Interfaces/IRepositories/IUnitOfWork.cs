using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IUnitOfWork : IDisposable
    {
        IFolderRepository Folders { get; }
        INoteRepository Notes { get; }
        IBaseRepository<ApplicationUser> Users { get; }
        IBaseRepository<Attachment> Attachments { get; }
        IBaseRepository<Tag> Tags { get; }
        IBaseRepository<NotesToTags> NotesToTages { get; }


        Task<int> Complete(CancellationToken ct = default);
    }
}
