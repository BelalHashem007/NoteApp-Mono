using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class FoldersController(IFolderService service) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<List<Folder>>> GetFolders()
        {
            var folders = await service.GetFolders();
            return Ok(folders);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<Folder>> GetFolder(Guid id)
        {
            var folder = await service.GetFolder(id);
            return Ok(folder);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateFolder(CreateFolderDto dto)
        {
            var folder = await service.CreateFolder(dto);
            return Ok(folder);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<Folder>> UpdateFolder(Guid id,UpdateFolderDto dto)
        {
            var folder = await service.UpdateFolder(id, dto);
            return Ok(folder);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteFolder(Guid id)
        {
            await service.DeleteFolder(id);
            return NoContent();
        }

    }
}
