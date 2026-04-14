using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface INoteService
    {
        public Task<List<NoteForSearchFilteredViewModel>> GetNotes(string userId, string searchQuery,string? tags, CancellationToken ct);
        public Task<NoteViewModel> GetNote(string userId, Guid id, CancellationToken ct);
        public Task<NoteViewModel> CreateNote(string userId, Guid folderId, CreateNoteViewModel dto, CancellationToken ct );
        public Task<NoteViewModel> UpdateNote(string userId, Guid id, UpdateNoteViewModel dto, CancellationToken ct);
        public Task DeleteNote(string userId, Guid id, CancellationToken ct);
        public Task<string> UploadImage(string userId, Guid noteId, IFormFile file, CancellationToken ct);
        public Task<NoteViewModel> GetBySlugName(string userId, string slug, CancellationToken ct);
    }
}
