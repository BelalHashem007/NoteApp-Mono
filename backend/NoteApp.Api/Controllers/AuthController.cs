using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NoteApp.Api.Configuration;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;
using NoteApp.Api.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NoteApp.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost]
        [Route("login")]
        public async Task<ActionResult> Login(LoginDto dto)
        {
            var result = await authService.Login(dto);
            if (result == null)
                return Unauthorized();
            else
                return Ok(result);
        }

        [HttpPost]
        [Route("signup")]
        public async Task<ActionResult> Signup(SignupDto dto)
        {
            await authService.Signup(dto);
            return Ok();
        }
    }
}
