using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IRepositories;
using System.Security.Claims;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController : ControllerBase
    {
        [HttpGet]
        [Route("{attachmentId}")]
        public async Task<IActionResult> GetAttachment( Guid attachmentId, [FromServices] IUnitOfWork unitOfWork)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var attachment = await unitOfWork.Attachments.Find(a => a.UserId == userId && a.Id == attachmentId );

            if (attachment == null)
                throw new NotFoundException("Resource not found");

            if (!System.IO.File.Exists(attachment.StoragePath))
                throw new ValidationException("File does not exist");

            return PhysicalFile(attachment.StoragePath, attachment.MimeType);
        }
    }
}
