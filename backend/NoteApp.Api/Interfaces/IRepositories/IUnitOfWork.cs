using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface IUnitOfWork : IDisposable
    {
        IBaseRepository<Folder> Folders { get; }
        IBaseRepository<Note> Notes { get; }

        Task<int> Complete();
    }
}
