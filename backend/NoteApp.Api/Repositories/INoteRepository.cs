using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Repositories
{
    public interface INoteRepository
    {
        public Task<List<Note>> GetNotes();
        public Task<Note?> GetNote(Guid id);
        public Task<Note> CreateNote(Note note);
        public Task UpdateNote(Note noteToUpdate);
        public Task DeleteNote(Guid id);
    }
}
