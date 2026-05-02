using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DreamTeamEver.Application.Auth;

namespace DreamTeamEver.Api.Authentication;

public static class ClaimsExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                 ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return id is null ? throw new InvalidOperationException("Missing user id claim.") : int.Parse(id);
    }

    public static int? GetStudentId(this ClaimsPrincipal user)
    {
        var v = user.FindFirstValue(AuthClaims.StudentId);
        return v == null ? null : int.Parse(v);
    }
}
