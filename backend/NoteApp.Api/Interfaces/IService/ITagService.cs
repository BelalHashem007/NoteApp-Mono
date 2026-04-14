using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Interfaces.IService
{
    public interface ITagService
    {
        public Task CreateTagOrAddToNote(string userId, TagDto tagDto, CancellationToken ct);
        public Task RemoveTag(string userId, TagDto tagDto, CancellationToken ct);
    }
}
