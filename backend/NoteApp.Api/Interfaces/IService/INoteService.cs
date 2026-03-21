using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface INoteService
    {
        public Task<List<NoteDto>> GetNotes(string userId, Guid folderId);
        public Task<NoteDto> GetNote(string userId, Guid folderId , Guid id);
        public Task<NoteDto> CreateNote(string userId, Guid folderId, CreateNoteDto dto);
        public Task<NoteDto> UpdateNote(string userId,Guid folderId, Guid id, UpdateNoteDto dto);
        public Task DeleteNote(string userId, Guid folderId, Guid id);
    }
}
