using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DreamTeamEver.Application.Auth;

namespace DreamTeamEver.Api.Authorization;

public static class ClaimsExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                 ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id is null || !Guid.TryParse(id, out var userId))
            throw new InvalidOperationException("Missing or invalid user id claim.");
        return userId;
    }

    public static Guid? GetMemberId(this ClaimsPrincipal user)
    {
        var v = user.FindFirstValue(AuthClaims.MemberId);
        return v != null && Guid.TryParse(v, out var memberId) ? memberId : null;
    }

    public static string? GetAccessTokenJti(this ClaimsPrincipal user) =>
        user.FindFirstValue(JwtRegisteredClaimNames.Jti);

    public static DateTimeOffset? GetAccessTokenExpiresUtc(this ClaimsPrincipal user)
    {
        var exp = user.FindFirstValue(JwtRegisteredClaimNames.Exp);
        if (exp is null || !long.TryParse(exp, out var seconds))
            return null;
        return DateTimeOffset.FromUnixTimeSeconds(seconds);
    }
}
