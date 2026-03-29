using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;
using System.Linq.Expressions;

namespace NoteApp.Api.Repositories
{
    public class NoteRepository : BaseRepository<Note>, INoteRepository
    {
        private readonly AppDbContext _context;
        public NoteRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Note>> GetAllNotesWithSearch(Expression<Func<Note, bool>> criteria, string? searchQuery, CancellationToken ct = default)
        {
            var query = _context.Notes.AsQueryable();

            query = query.Where(criteria);

            if (!string.IsNullOrEmpty(searchQuery))
                query = query.Where(n => n.Title.Contains(searchQuery) || n.Body.Contains(searchQuery));

            return await query.ToListAsync(ct);
        }
    }
}
