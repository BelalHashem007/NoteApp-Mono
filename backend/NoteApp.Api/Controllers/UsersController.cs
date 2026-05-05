using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Extensions;
using NoteApp.Api.Interfaces.IService;
using NoteApp.Api.Entities.DTOs;

namespace NoteApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/[controller]")]
    public class UsersController(IUserService userService) : ControllerBase
    {
        [HttpGet]
        [Route("me")]
        public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
        {
            var userId = User.GetUserId();
            var result = await userService.GetUser(userId, ct);
            return Ok(new ResponseViewModel<ApplicationUserViewModel>()
            {
                Success = true,
                Message = "Retrieved User data successfully",
                Data = result
            });
        }
    }
}
