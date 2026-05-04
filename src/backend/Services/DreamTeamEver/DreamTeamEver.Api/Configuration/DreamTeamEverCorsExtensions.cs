using Microsoft.Extensions.Hosting;

namespace DreamTeamEver.Api.Configuration;

public static class DreamTeamEverCorsExtensions
{
    public const string AllowAllPolicy = "DreamTeamEver.AllowAll";

    /// <summary>
    /// SPA-friendly CORS: permissive in Development; configured origins from <c>Cors:Origins</c> otherwise.
    /// </summary>
    public static IServiceCollection AddDreamTeamEverCors(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(AllowAllPolicy, policy =>
            {
                if (environment.IsDevelopment())
                {
                    policy.SetIsOriginAllowed(_ => true).AllowAnyHeader().AllowAnyMethod();
                }
                else
                {
                    var origins = configuration.GetSection("Cors:Origins").Get<string[]>()
                        ?? Array.Empty<string>();
                    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
                }
            });
        });

        return services;
    }
}
