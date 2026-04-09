using NoteApp.Api.Entities;
using System.Linq.Expressions;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface INoteRepository : IBaseRepository<Note>
    {
        public Task<IEnumerable<Note>> GetAllNotesWithSearch(Expression<Func<Note, bool>> criteria, string? searchQuery, CancellationToken ct = default);
        public Task<Note?> FindWithAttachments(Expression<Func<Note, bool>> criteria, CancellationToken ct = default);
    }
}
