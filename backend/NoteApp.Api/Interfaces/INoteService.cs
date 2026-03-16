using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces
{
    public interface INoteService
    {
        public Task<List<NoteDto>> GetNotes(Guid folderId);
        public Task<NoteDto> GetNote(Guid id);
        public Task<NoteDto> CreateNote(Guid folderId,CreateNoteDto dto);
        public Task<NoteDto> UpdateNote(Guid id,UpdateNoteDto dto);
        public Task DeleteNote(Guid id);
    }
}
