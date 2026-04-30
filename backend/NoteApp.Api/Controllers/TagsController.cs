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
    public class TagsController(ITagService tagService) : ControllerBase
    {
        [HttpPost]
        [Route("")]
        public async Task<IActionResult> CreateTagOrAddToNote(TagDto tagDto, CancellationToken ct)
        {
            var userId = User.GetUserId();
            await tagService.CreateTagOrAddToNote(userId, tagDto, ct);
            return Ok();
        }

        [HttpDelete]
        [Route("")]
        public async Task<IActionResult> RemoveTag(TagDto tagDto, CancellationToken ct)
        {
            var userId = User.GetUserId();
            await tagService.RemoveTag(userId, tagDto, ct);
            return NoContent();
        }
    }
}
