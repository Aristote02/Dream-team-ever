using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Auth;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DreamTeamEver.Application.Services;

public sealed class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _options;

    public JwtTokenGenerator(IOptions<JwtOptions> options) => _options = options.Value;

    public (string AccessToken, DateTimeOffset AccessExpiresAtUtc, string Jti) CreateAccessToken(User user, Guid? memberId)
    {
        var jti = Guid.NewGuid().ToString("N");
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_options.AccessTokenMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, jti),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("role", user.Role.ToString()),
        };

        if (memberId is { } mid)
            claims.Add(new Claim(AuthClaims.MemberId, mid.ToString()));

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return (jwt, expiresAt, jti);
    }
}
