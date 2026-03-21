using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IRepositories;

namespace NoteApp.Api.Repositories
{
    public class NoteRepository(AppDbContext context) : INoteRepository
    {
        public async Task<List<Note>> GetNotes(string userId, Guid folderId)
        {
            return await context.Notes.Where(x => x.FolderId == folderId && x.UserId == userId).ToListAsync();
        }

        public async Task<Note?> GetNote(string userId, Guid folderId, Guid id)
        {
            var note = await context.Notes.FirstOrDefaultAsync(x => x.UserId == userId && x.FolderId == folderId && x.Id == id);
            return note;
        }

        public async Task<Note> CreateNote(Note note)
        {
            context.Notes.Add(note);
            await context.SaveChangesAsync();
            return note;
        }

        public async Task UpdateNote(Note noteToUpdate)
        {
            await context.SaveChangesAsync();
        }

        public async Task DeleteNote(string userId, Guid folderId, Guid id)
        {
            var note = await GetNote(userId, folderId, id);
            if (note != null)
            {
                context.Notes.Remove(note);
                await context.SaveChangesAsync();
            }
        }
    }
}
