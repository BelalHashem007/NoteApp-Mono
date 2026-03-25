using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService, IWebHostEnvironment env) : ControllerBase
    {
        [HttpPost]
        [Route("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType<ResponseViewModel>(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Login(LoginViewModel dto)
        {
            var result = await authService.Login(dto);
            if (result != null && !string.IsNullOrWhiteSpace(result.RefreshToken))
                SetRefreshTokenToCookie(result.RefreshToken, result.RefreshTokenExpiration);

            var response = new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Message = "Successful login",
                Data = result
            };

            return Ok(response);
        }

        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Register(RegisterViewModel dto)
        {
            var result = await authService.Register(dto);
            if (result != null && !string.IsNullOrWhiteSpace(result.RefreshToken))
                SetRefreshTokenToCookie(result.RefreshToken, result.RefreshTokenExpiration);

            var response = new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Message = "Successful register",
                Data = result
            };

            return Ok(response);
        }

        [HttpPost]
        [Route("refresh")]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Refresh([FromBody] RefreshTokenViewModel? dto)
        {
            var refreshToken = Request.Cookies["refreshToken"] ?? dto?.RefreshToken;
            if (refreshToken == null)
                throw new ValidationException("Missing refreshToken");

            var result = await authService.RefreshToken(refreshToken);
            if (result != null && !string.IsNullOrWhiteSpace(result.RefreshToken))
                SetRefreshTokenToCookie(result.RefreshToken, result.RefreshTokenExpiration);

            var response = new ResponseViewModel<AuthViewModel>
            {
                Success = true,
                Message = "Successful refresh",
                Data = result
            };

            return Ok(response);
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
