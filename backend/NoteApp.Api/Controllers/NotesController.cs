using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/folders/{folderId}/notes")]
    public class NotesController(INoteService service) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<ResponseViewModel<IEnumerable<NoteViewModel>>>> GetNotes(Guid folderId, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.GetNotes(userId, folderId,ct);
            var response = new ResponseViewModel<IEnumerable<NoteViewModel>>
            {
                Success = true,
                Message = "Retrieved notes successfully",
                Data = result,
            };

            return Ok(response);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> GetNote(Guid folderId,Guid id, CancellationToken ct )
        {
            var userId = User.GetUserId();

            var result = await service.GetNote(userId, folderId, id,ct);
            var response = new ResponseViewModel<NoteViewModel>
            {
                Success = true,
                Message = "Retrieved note successfully",
                Data = result,
            };

            return Ok(response);
        }

        [HttpPost]
        [Route("")]
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

            return CreatedAtAction(nameof(GetNote) , new { folderId, id = result.Id}, response);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> UpdateNote(Guid folderId,Guid id,UpdateNoteViewModel dto, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.UpdateNote(userId, folderId, id, dto,ct);
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
        public async Task<ActionResult> DeleteNote(Guid folderId, Guid id, CancellationToken ct)
        {
            var userId = User.GetUserId();

            await service.DeleteNote(userId, folderId, id, ct);
            return NoContent();
        }
    }
}
