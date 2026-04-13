using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using System.Linq.Expressions;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface INoteRepository : IBaseRepository<Note>
    {
        public Task<List<NoteForSearchViewModel>> GetAllNotesWithSearch(string userId, string searchQuery, CancellationToken ct = default);
        public Task<Note?> FindWithAttachments(Expression<Func<Note, bool>> criteria, CancellationToken ct = default);
    }
}
