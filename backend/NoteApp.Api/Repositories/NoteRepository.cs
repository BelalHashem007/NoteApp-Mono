using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IRepositories;
using System.Linq.Expressions;

namespace NoteApp.Api.Repositories
{
    public class NoteRepository : BaseRepository<Note>, INoteRepository
    {
        private readonly AppDbContext _context;
        private readonly AppDbContextDapper _dapper;
        public NoteRepository(AppDbContext context, AppDbContextDapper dapper) : base(context)
        {
            _context = context;
            _dapper = dapper;
        }

        public async Task<List<NoteForSearchViewModel>> GetAllNotesWithSearch(string userId,string searchQuery, CancellationToken ct = default)
        {
            var results = await _dapper.GetNotesWithSearch(userId, searchQuery);
            return results;
        }

        public async Task<Note?> FindWithAttachments(Expression<Func<Note, bool>> criteria, CancellationToken ct = default)
        {
            return await _context.Notes.Include(n => n.Attachments).SingleOrDefaultAsync(criteria, ct);
        }
    }
}
