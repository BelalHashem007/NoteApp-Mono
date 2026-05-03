using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Extensions;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;
using System.Security.Claims;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/notes")]
    public class NotesController(INoteService service) : ControllerBase
    {
        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> GetNote(Guid id, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.GetNote(userId, id, ct);
            var response = new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Retrieved note successfully",
                Data = result,
            };

            return Ok(response);
        }

        [HttpPost]
        [Route("~/api/folders/{folderId}/notes")]
        public async Task<ActionResult> CreateNote(Guid folderId, CreateNoteViewModel dto, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.CreateNote(userId, folderId, dto, ct);
            var response = new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Created note successfully",
                Data = result,
            };

            return CreatedAtAction(nameof(GetNote), new { folderId, id = result.Id }, response);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> UpdateNote(Guid id, UpdateNoteViewModel dto, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.UpdateNote(userId, id, dto, ct);
            var response = new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Updated note successfully",
                Data = result,
            };
            return Ok(result);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteNote(Guid id, CancellationToken ct)
        {
            var userId = User.GetUserId();

            await service.DeleteNote(userId, id, ct);
            return NoContent();
        }

        [HttpPost]
        [Route("{id}/upload-image")]
        public async Task<ActionResult<ResponseViewModel<AttachmentViewModel>>> UploadImage(Guid id, IFormFile file, CancellationToken ct)
        {
            var userId = User.GetUserId();
            var attachmentId = await service.UploadImage(userId, id, file, ct);
            var response = new ResponseViewModel<AttachmentViewModel>()
            {
                Success = true,
                Message = "Image uploaded successfully",
                Data = new AttachmentViewModel { AttachmentId = attachmentId }
            };

            return Ok(response);
        }

        [HttpGet]
        [Route("GetBySlug/{slug}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> GetNoteBySlug(string slug, CancellationToken ct)
        {
            var userId = User.GetUserId();
            var result = await service.GetBySlugName(userId, slug, ct);
            var response = new ResponseViewModel<NoteViewModel>()
            {
                Success = true,
                Message = "Retrieved Note Successfully",
                Data = result
            };

            return Ok(response);
        }

        [HttpPut]
        [Route("{noteId}/{folderId}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> MoveNote(Guid noteId, Guid folderId, CancellationToken ct)
        {
            var userId = User.GetUserId();
            var result = await service.MoveNote(userId, noteId, folderId, ct);
            var response = new ResponseViewModel<NoteViewModel>()
            {
                Success = true,
                Message = "Moved Note Successfully",
                Data = result
            };
            return Ok(response);
        }
    }
}
