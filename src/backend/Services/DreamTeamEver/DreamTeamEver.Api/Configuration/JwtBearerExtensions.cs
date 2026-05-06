using System.IdentityModel.Tokens.Jwt;
using System.Text;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace DreamTeamEver.Api.Configuration;

public static class JwtBearerExtensions
{
    public static IServiceCollection AddDreamTeamEverJwtBearer(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection(JwtOptions.SectionName);
        var jwtOptions = jwtSection.Get<JwtOptions>() ?? throw new InvalidOperationException("Jwt options are not configured.");
        if (string.IsNullOrWhiteSpace(jwtOptions.Key))
        {
            throw new InvalidOperationException("Jwt:Key is required.");
        }

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
                    RoleClaimType = "role",
                    NameClaimType = JwtRegisteredClaimNames.Sub,
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var jti = context.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
                        if (string.IsNullOrEmpty(jti))
                        {
                            return;
                        }

                        var blacklist = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();
                        if (await blacklist.IsAccessTokenBlacklistedAsync(jti, context.HttpContext.RequestAborted))
                        {
                            context.Fail("This token has been revoked.");
                        }
                    }
                };
            });

        services.AddAuthorization();
        return services;
    }
}
