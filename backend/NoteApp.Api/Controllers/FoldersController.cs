using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;
using System.Security.Claims;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FoldersController(IFolderService folderService) : ControllerBase
    {
        [HttpGet]
        [Route("")]
        public async Task<ActionResult<ResponseViewModel<IEnumerable<FolderViewModel>>>> GetFolders(CancellationToken ct)
        {
            var userId = User.GetUserId();

            var result = await folderService.GetFolders(userId, ct);
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

            var result = await folderService.GetFolder(userId, id,ct);
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

            var result = await folderService.CreateFolder(userId, dto,ct);

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

            var result = await folderService.UpdateFolder(userId, id, dto, ct);
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

            await folderService.DeleteFolder(userId, id, ct);
            return NoContent();
        }

        [HttpGet]
        [Route("GetAllItems")]
        public async Task<ActionResult<ResponseViewModel<FoldersAndNotesAndTagsViewModel>>> GetAllFolderItems()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await folderService.GetAllFolderItems(userId);

            var response = new ResponseViewModel<FoldersAndNotesAndTagsViewModel>
            {
                Success = true,
                Message = "Retrieved all the items successfully",
                Data = result
            };

            return Ok(response);
        }
    }
}
