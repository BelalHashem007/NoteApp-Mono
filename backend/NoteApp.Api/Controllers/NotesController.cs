using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.DTOs;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class NotesController(INoteService service) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<List<Note>>> GetNotes()
        {
            var notes = await service.GetNotes();
            return Ok(notes);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<Note>> GetNote(Guid id)
        {
            var note = await service.GetNote(id);
            return Ok(note);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateNote(CreateNoteDto dto)
        {
            var note = await service.CreateNote(dto);
            return CreatedAtAction(nameof(GetNote) , new { id = note.Id}, note);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<Note>> UpdateNote(Guid id,UpdateNoteDto dto)
        {
            var note = await service.UpdateNote(id, dto);
            return Ok(note);
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
