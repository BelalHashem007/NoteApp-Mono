using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Data;
using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces;

namespace NoteApp.Api.Services
{
    public class NoteService(AppDbContext context) : INoteService
    {
        public async Task<Note> CreateNote(CreateNoteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ArgumentException("Note name is required");

            if (string.IsNullOrWhiteSpace(dto.Body))
                throw new ArgumentException("Note body is required");

            var newNote = new Note();
            newNote.Title = dto.Title;
            newNote.Body = dto.Body;
            context.Notes.Add(newNote);
            await context.SaveChangesAsync();
            return newNote;
        }

        public async Task DeleteNote(Guid id)
        {
            var noteToDelete = await context.Notes.FindAsync(id);
            if (noteToDelete == null)
                throw new ArgumentException("Note doesn`t exist");

            context.Notes.Remove(noteToDelete);
            await context.SaveChangesAsync();
        }

        public async Task<Note> GetNote(Guid id)
        {
            var note = await context.Notes.FindAsync(id);

            if (note == null)
                throw new ArgumentException("Note doesn`t exist");
            return note;
        }

        public async Task<List<Note>> GetNotes()
        {
            var notes = await context.Notes.ToListAsync();
            return notes;
        }

        public async Task<Note> UpdateNote(Guid id,UpdateNoteDto dto)
        {
            var note = await context.Notes.FindAsync(id);
            if (note == null)
                throw new ArgumentException("Note doesn`t exist");

            if (dto.Body != null)
                note.Body = dto.Body;

            if (dto.Title != null)
                note.Title = dto.Title;

            await context.SaveChangesAsync();

            return note;
        }
    }
}
