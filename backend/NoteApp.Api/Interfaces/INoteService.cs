using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces
{
    public interface INoteService
    {
        public Task<List<Note>> GetNotes();
        public Task<Note> GetNote(Guid id);
        public Task<Note> CreateNote(CreateNoteDto dto);
        public Task<Note> UpdateNote(Guid id,UpdateNoteDto dto);
        public Task DeleteNote(Guid id);
    }
}
