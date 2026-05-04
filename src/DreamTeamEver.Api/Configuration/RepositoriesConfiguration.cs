using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Infrastructure.Data.Repositories;

namespace DreamTeamEver.Api.Configuration;

public static class RepositoriesConfiguration
{
    /// <summary>
    /// Registers Mapster profiles and EF-backed repositories. Call after <c>AddDatabase</c> and before <c>AddInfrastructure</c>.
    /// </summary>
    public static IServiceCollection ConfigureRepositories(this IServiceCollection services, IConfiguration configuration)
    {
        _ = configuration;

        DreamTeamEverMappingRegister.ApplyGlobal();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();

        return services;
    }
}
