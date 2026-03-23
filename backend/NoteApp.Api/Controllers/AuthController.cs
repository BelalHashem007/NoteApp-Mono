using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NoteApp.Api.Configuration;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController(IAuthService authService, IOptions<JwtOptions> options, IWebHostEnvironment env) : ControllerBase
    {
        [HttpPost]
        [Route("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType<ResponseViewModel>(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Login(LoginViewModel dto)
        {
            var result = await authService.Login(dto);
            if (result.Data?.AccessToken != null)
                Response.Cookies.Append("accessToken", result.Data.AccessToken, new CookieOptions
                {
                    MaxAge = TimeSpan.FromMinutes(options.Value.LifeTime),
                    HttpOnly = true,
                    Secure = !env.IsDevelopment(),
                    SameSite = env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.Strict,
                });
            return Ok(result);
        }

        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Register(RegisterViewModel dto)
        {
            var result = await authService.Register(dto);
            if (result.Data?.AccessToken != null)
                Response.Cookies.Append("accessToken", result.Data.AccessToken, new CookieOptions
                {
                    MaxAge = TimeSpan.FromMinutes(options.Value.LifeTime),
                    HttpOnly = true,
                    Secure = !env.IsDevelopment(),
                    SameSite = env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.Strict,
                });
            return Ok(result);
        }
    }
}
