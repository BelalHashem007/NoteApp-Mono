using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;
using static Azure.Core.HttpHeader;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("folders/{folderId}/notes")]
    public class NotesController(INoteService service) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<ResponseViewModel<IEnumerable<NoteViewModel>>>> GetNotes(Guid folderId)
        {
            var userId = User.GetUserId();

            var result = await service.GetNotes(userId, folderId);
            return Ok(result);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> GetNote(Guid folderId,Guid id)
        {
            var userId = User.GetUserId();

            var result = await service.GetNote(userId, folderId, id);
            return Ok(result);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateNote(Guid folderId, CreateNoteViewModel dto)
        {
            var userId = User.GetUserId();

            var result = await service.CreateNote(userId, folderId, dto);
            return CreatedAtAction(nameof(GetNote) , new { folderId, id = result.Data?.Id}, result);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<NoteViewModel>>> UpdateNote(Guid folderId,Guid id,UpdateNoteViewModel dto)
        {
            var userId = User.GetUserId();

            var result = await service.UpdateNote(userId, folderId, id, dto);
            return Ok(result);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteNote(Guid folderId, Guid id)
        {
            var userId = User.GetUserId();

            await service.DeleteNote(userId, folderId, id);
            return NoContent();
        }
    }
}
