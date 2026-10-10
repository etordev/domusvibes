using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace DomusVibes.Api.Auth
{
    public static class CurrentUser
    {
        public static Guid Id(ClaimsPrincipal user)
        {
            var value = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(value, out var id))
                throw new UnauthorizedAccessException("Sign in again.");

            return id;
        }
    }
}
