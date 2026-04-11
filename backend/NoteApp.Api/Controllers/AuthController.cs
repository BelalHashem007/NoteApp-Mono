using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces.IService;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService, ILogger<AuthController> logger, SignInManager<ApplicationUser> signInManager) : ControllerBase
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

            logger.LogInformation("User {Email} Created account with id {UserId}", result?.User.Email, result?.User.Id);
            return Ok(response);
        }

        [HttpPost]
        [Route("refresh")]
        public async Task<ActionResult<ResponseViewModel<AuthViewModel>>> Refresh([FromBody] RefreshTokenViewModel? dto, CancellationToken ct)
        {
            var refreshToken = Request.Cookies["refreshToken"] ?? dto?.RefreshToken;
            if (refreshToken == null)
                throw new ValidationException("Missing refreshToken");

            var result = await authService.RefreshToken(refreshToken, ct);
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

        [HttpGet]
        [Route("login/google")]
        public IActionResult LoginGoogle([FromQuery] string returnUrl)
        {
            var redirectUrl = $"http://localhost:5001/api/auth/login/google/callback?returnUrl={returnUrl}";
            var properties = signInManager.ConfigureExternalAuthenticationProperties(provider: "Google", redirectUrl);

            return Challenge(properties,"Google");
        }

        [HttpGet]
        [Route("login/google/callback")]
        public async Task<IActionResult> LoginGoogleCallback([FromQuery] string returnUrl)
        {
            var info = await signInManager.GetExternalLoginInfoAsync();
            var result = await authService.GoogleLogin(info);
            return Redirect($"{returnUrl}?accessToken={result.AccessToken}&refreshToken={result.RefreshToken}&accessExp={result.AccessTokenExpiresOn}&refreshExp={result.RefreshTokenExpiresOn}");
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
