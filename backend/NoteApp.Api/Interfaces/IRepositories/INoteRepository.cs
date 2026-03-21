using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IRepositories
{
    public interface INoteRepository
    {
        public Task<List<Note>> GetNotes(string userId, Guid folderId);
        public Task<Note?> GetNote(string userId, Guid folderId, Guid id);
        public Task<Note> CreateNote(Note note);
        public Task UpdateNote(Note noteToUpdate);
        public Task DeleteNote(string userId, Guid folderId, Guid id);
    }
}
