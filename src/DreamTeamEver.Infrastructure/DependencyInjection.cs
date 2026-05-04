using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DreamTeamEver.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DreamTeamEverOptions>(
            configuration.GetSection(DreamTeamEverOptions.SectionName));
        services.Configure<JwtOptions>(
            configuration.GetSection(JwtOptions.SectionName));
        services.Configure<AdminSeedOptions>(
            configuration.GetSection(AdminSeedOptions.SectionName));

        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        return services;
    }
}
