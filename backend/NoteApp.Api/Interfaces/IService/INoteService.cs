using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface INoteService
    {
        public Task<ResponseViewModel<IEnumerable<NoteViewModel>>> GetNotes(string userId, Guid folderId);
        public Task<ResponseViewModel<NoteViewModel>> GetNote(string userId, Guid folderId , Guid id);
        public Task<ResponseViewModel<NoteViewModel>> CreateNote(string userId, Guid folderId, CreateNoteViewModel dto);
        public Task<ResponseViewModel<NoteViewModel>> UpdateNote(string userId,Guid folderId, Guid id, UpdateNoteViewModel dto);
        public Task DeleteNote(string userId, Guid folderId, Guid id);
    }
}
