using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<ActionResult<ResponseViewModel<IEnumerable<FolderViewModel>>>> GetFolders()
        {
            var userId = User.GetUserId();

            var result = await service.GetFolders(userId);
            return Ok(result);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<FolderViewModel>>> GetFolder(Guid id)
        {
            var userId = User.GetUserId();

            var result = await service.GetFolder(userId, id);
            return Ok(result);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateFolder(CreateFolderViewModel dto)
        {
            var userId = User.GetUserId();

            var result = await service.CreateFolder(userId, dto);
            return CreatedAtAction(nameof(GetFolder), new { id = result.Data?.Id }, result);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<FolderViewModel>>> UpdateFolder(Guid id,UpdateFolderViewModel dto)
        {
            var userId = User.GetUserId();

            var result = await service.UpdateFolder(userId, id, dto);
            return Ok(result);
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
