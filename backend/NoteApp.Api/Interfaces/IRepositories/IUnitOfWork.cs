using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IUnitOfWork : IDisposable
    {
        IBaseRepository<Folder> Folders { get; }
        INoteRepository Notes { get; }

        Task<int> Complete(CancellationToken ct = default);
    }
}
