using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DreamTeamEver.Application.DI;

/// <summary>Registers application-layer services (implementations of <c>DreamTeamEver.Application.Abstractions</c> contracts).</summary>
public static class ApplicationDependencies
{
    public static IServiceCollection ConfigureApplication(this IServiceCollection services, IConfiguration configuration)
    {
        _ = configuration;

        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IMemberService, MemberService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IMatriculeService, MatriculeService>();

        return services;
    }
}
