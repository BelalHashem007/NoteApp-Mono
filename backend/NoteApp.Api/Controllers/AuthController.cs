using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost]
        [Route("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType<ResponseViewModel>(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Login(LoginViewModel dto)
        {
            var result = await authService.Login(dto);
            return Ok(result);
        }
    }
}
