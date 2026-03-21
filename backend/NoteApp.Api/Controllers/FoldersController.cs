using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;

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
            var userId = User.GetUserId();

            var folders = await service.GetFolders(userId);
            return Ok(folders);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<Folder>> GetFolder(Guid id)
        {
            var userId = User.GetUserId();

            var folder = await service.GetFolder(userId, id);
            return Ok(folder);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateFolder(CreateFolderDto dto)
        {
            var userId = User.GetUserId();

            var folder = await service.CreateFolder(userId, dto);
            return Ok(folder);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<Folder>> UpdateFolder(Guid id,UpdateFolderDto dto)
        {
            var userId = User.GetUserId();

            var folder = await service.UpdateFolder(userId, id, dto);
            return Ok(folder);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteFolder(Guid id)
        {
            var userId = User.GetUserId();

            await service.DeleteFolder(userId, id);
            return NoContent();
        }

    }
}
