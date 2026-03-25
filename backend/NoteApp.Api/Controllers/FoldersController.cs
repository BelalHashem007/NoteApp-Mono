using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FoldersController(IFolderService service) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<ResponseViewModel<IEnumerable<FolderViewModel>>>> GetFolders(CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.GetFolders(userId, ct);
            var response = new ResponseViewModel<IEnumerable<FolderViewModel>>
            {
                Success = true,
                Message = "Retrieved folders successfully",
                Data = result,
            };

            return Ok(response);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<FolderViewModel>>> GetFolder(Guid id, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.GetFolder(userId, id,ct);
            var response =  new ResponseViewModel<FolderViewModel>
            {
                Success = true,
                Message = "Retrieved folder successfully",
                Data = result,
            };

            return Ok(response);
        }

        [HttpPost]
        [Route("")]
        public async Task<ActionResult> CreateFolder(CreateFolderViewModel dto, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.CreateFolder(userId, dto,ct);

            var response = new ResponseViewModel<FolderViewModel>
            {
                Success = true,
                Message = "Created folder successfully",
                Data = result,
            };

            return CreatedAtAction(nameof(GetFolder), new { id = result.Id }, response);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<ResponseViewModel<FolderViewModel>>> UpdateFolder(Guid id,UpdateFolderViewModel dto, CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await service.UpdateFolder(userId, id, dto, ct);
            var response =  new ResponseViewModel<FolderViewModel>
            {
                Success = true,
                Message = "Updated folder successfully",
                Data = result,
            };

            return Ok(response);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteFolder(Guid id, CancellationToken ct)
        {
            var userId = User.GetUserId();

            await service.DeleteFolder(userId, id, ct);
            return NoContent();
        }

    }
}
