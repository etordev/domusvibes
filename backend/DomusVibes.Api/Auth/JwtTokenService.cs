using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace DomusVibes.Api.Auth
{
    public sealed class JwtTokenService
    {
        private readonly string _issuer;
        private readonly string _audience;
        private readonly SigningCredentials _credentials;
        private readonly int _hours;

        public JwtTokenService(IConfiguration configuration)
        {
            var section = configuration.GetSection("Jwt");
            _issuer = section["Issuer"] ?? "DomusVibes";
            _audience = section["Audience"] ?? "DomusVibes";
            var key = section["Key"] ?? "";
            _credentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256);
            _hours = int.TryParse(section["Hours"], out var hours) && hours > 0 ? hours : 8;
        }

        public string Create(Guid userId, string name, string email)
        {
            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims:
                [
                    new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, email),
                    new Claim("name", name)
                ],
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddHours(_hours),
                signingCredentials: _credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
