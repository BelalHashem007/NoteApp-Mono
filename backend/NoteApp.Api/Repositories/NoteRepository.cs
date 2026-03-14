using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Repositories
{
    public class NoteRepository(AppDbContext context) : INoteRepository
    {
        public async Task<Note> CreateNote(Note note)
        {
            context.Notes.Add(note);
            await context.SaveChangesAsync();
            return note;
        }

        public async Task DeleteNote(Guid id)
        {
            var note = context.Notes.Find(id);
            if (note != null)
            {
                context.Notes.Remove(note);
                await context.SaveChangesAsync();
            }
        }

        public async Task<Note?> GetNote(Guid id)
        {
            var note = await context.Notes.FindAsync(id);
            return note;
        }

        public async Task<List<Note>> GetNotes()
        {
            return await context.Notes.ToListAsync();
        }

        public async Task UpdateNote(Note noteToUpdate)
        {
            await context.SaveChangesAsync();
        }
    }
}
