using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController(IAuthService authService, IWebHostEnvironment env) : ControllerBase
    {
        [HttpPost]
        [Route("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType<ResponseViewModel>(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Login(LoginViewModel dto)
        {
            var result = await authService.Login(dto);
            if (result.Data != null && !string.IsNullOrWhiteSpace(result.Data.RefreshToken))
                SetRefreshTokenToCookie(result.Data.RefreshToken, result.Data.RefreshTokenExpiration);
            return Ok(result);
        }

        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Register(RegisterViewModel dto)
        {
            var result = await authService.Register(dto);
            if (result.Data != null && !string.IsNullOrWhiteSpace(result.Data.RefreshToken))
                SetRefreshTokenToCookie(result.Data.RefreshToken, result.Data.RefreshTokenExpiration);
            return Ok(result);
        }

        [HttpGet]
        [Route("GetToken")]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> GetToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (refreshToken == null)
                throw new ValidationException("Missing refreshToken in cookies");

            var result = await authService.RefreshToken(refreshToken);
            if (result.Data != null && !string.IsNullOrWhiteSpace(result.Data.RefreshToken))
                SetRefreshTokenToCookie(result.Data.RefreshToken, result.Data.RefreshTokenExpiration);
            return Ok(result);
        }

        private void SetRefreshTokenToCookie(string refreshToken, DateTime refreshTokenExpiration)
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                Expires = refreshTokenExpiration.ToLocalTime(),
                HttpOnly = true,
            });
        }
    }
}
