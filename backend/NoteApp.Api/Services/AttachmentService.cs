using NoteApp.Api.Entities;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Services
{
    public class AttachmentService(IUnitOfWork unitOfWork) : IAttachmentService
    {
        public async Task<Attachment> GetAttachment(Guid attachmentId, string userId, CancellationToken ct)
        {
            var attachment = await unitOfWork.Attachments.Find(a => a.UserId == userId && a.Id == attachmentId, ct);

            if (attachment == null)
                throw new NotFoundException("Resource not found");

            if (!File.Exists(attachment.StoragePath))
                throw new ValidationException("File does not exist");

            return attachment;
        }

        public async Task RemoveAttachment(Guid attachmentId, string userId, CancellationToken ct)
        {
            var attachment = await unitOfWork.Attachments.Find(a => a.UserId == userId && a.Id == attachmentId, ct);

            if (attachment == null)
                throw new ValidationException("Resource not found");

            attachment.IsDeleted = true;
            attachment.DeletedAt = DateTime.UtcNow;

            await unitOfWork.Complete();
        }
    }
}
