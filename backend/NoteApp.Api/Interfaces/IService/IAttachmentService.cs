using NoteApp.Api.Entities;

namespace NoteApp.Api.Interfaces.IService
{
    public interface IAttachmentService
    {
        public Task<Attachment> GetAttachment(Guid attachmentId, string userId, CancellationToken ct);
    }
}
