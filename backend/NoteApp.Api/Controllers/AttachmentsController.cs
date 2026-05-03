using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController(IAttachmentService attachmentService) : ControllerBase
    {
        [HttpGet]
        [Route("{attachmentId}")]
        public async Task<IActionResult> GetAttachment(Guid attachmentId, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var attachment = await attachmentService.GetAttachment(attachmentId, userId, ct);

            return Redirect(attachment.StoragePath);
        }
    }
}
