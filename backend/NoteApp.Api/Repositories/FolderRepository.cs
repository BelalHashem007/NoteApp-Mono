using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class FolderRepository :  BaseRepository<Folder>, IFolderRepository
    {
        private readonly AppDbContext _context;
        public FolderRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<FoldersAndNotesViewModel>> GetAllItems(string userId)
        {
            var folders = await _context.Folders.AsNoTracking().Where(f => f.UserId == userId).Select(f => new FoldersAndNotesViewModel
            {
                Id = f.Id,
                FolderName = f.FolderName,
                Notes = f.Notes.Select(n => new NoteWithoutBodyViewModel { Id = n.Id, Title = n.Title, Slug = n.Slug, Tags = n.Tags.Select(t => new TagViewModel {Id = t.Id, Name = t.Name }).ToList() }).ToList(),
                ParentId = f.ParentId,
                CreatedAt = f.CreatedAt,
            }).AsSplitQuery().ToListAsync();

            return folders;
        }
    }
}
