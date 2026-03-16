using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces;
using static Azure.Core.HttpHeader;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("folders/{folderId}/notes")]
    public class NotesController(INoteService service) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<List<NoteDto>>> GetNotes(Guid folderId)
        {
            var notes = await service.GetNotes(folderId);
            var response = new { notes, folderId };
            return Ok(response);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<NoteDto>> GetNote(Guid folderId,Guid id)
        {
            var note = await service.GetNote(id);
            var response = new { note, folderId };
            return Ok(response);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateNote(Guid folderId, CreateNoteDto dto)
        {
            var note = await service.CreateNote(folderId, dto);
            var response = new { note, folderId };
            return CreatedAtAction(nameof(GetNote) , new { folderId, id = response.note.Id}, response);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<NoteDto>> UpdateNote(Guid folderId,Guid id,UpdateNoteDto dto)
        {
            var note = await service.UpdateNote(id, dto);
            var response = new { note, folderId };
            return Ok(response);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteNote(Guid id)
        {
            await service.DeleteNote(id);
            return NoContent();
        }
    }
}
