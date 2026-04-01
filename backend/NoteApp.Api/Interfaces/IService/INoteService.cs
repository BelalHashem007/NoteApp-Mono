using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface INoteService
    {
        public Task<IEnumerable<NoteViewModel>> GetNotes(string userId, Guid folderId,string? searchQuery, CancellationToken ct);
        public Task<NoteViewModel> GetNote(string userId, Guid folderId , Guid id, CancellationToken ct);
        public Task<NoteViewModel> CreateNote(string userId, Guid folderId, CreateNoteViewModel dto, CancellationToken ct );
        public Task<NoteViewModel> UpdateNote(string userId,Guid folderId, Guid id, UpdateNoteViewModel dto, CancellationToken ct);
        public Task DeleteNote(string userId, Guid folderId, Guid id, CancellationToken ct);
        public Task<string> UploadImage(string userId, Guid noteId, IFormFile file, CancellationToken ct);
    }
}
