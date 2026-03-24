using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NoteApp.Api.Configuration;
using NoteApp.Api.Entities;
using NoteApp.Api.Interfaces.IService;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;

namespace NoteApp.Api.Services
{
    public class TokenService(IOptions<JwtOptions> options) : ITokenService
    {
        public string GenerateJwtToken(ApplicationUser user, IList<string>? roles)
        {
            var authClaim = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.Id),
                    new(ClaimTypes.Email, user.Email)
                };

            if(roles != null)
                foreach (var role in roles)
                    authClaim.Add(new Claim(ClaimTypes.Role, role));

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtOptions = options.Value;
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = jwtOptions.Issuer,
                Audience = jwtOptions.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
                SecurityAlgorithms.HmacSha256),
                Expires = DateTime.UtcNow.AddMinutes(jwtOptions.LifeTime),
                Subject = new ClaimsIdentity(authClaim)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(securityToken);
            return accessToken;
        }

        public RefreshToken GenerateRefreshToken()
        {
            var randomNumber = new byte[32];

            var generator = RandomNumberGenerator.Create();

            generator.GetBytes(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                CreatedOn = DateTime.UtcNow,
                ExpiresOn = DateTime.UtcNow.AddDays(10)
            };
        }
    }
}
