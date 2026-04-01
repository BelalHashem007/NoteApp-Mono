using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IUnitOfWork : IDisposable
    {
        IFolderRepository Folders { get; }
        IBaseRepository<Attachment> Attachments { get; }
        INoteRepository Notes { get; }

        Task<int> Complete(CancellationToken ct = default);
    }
}
