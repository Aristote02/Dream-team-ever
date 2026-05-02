using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Infrastructure.Persistence;
using DreamTeamEver.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        services.AddScoped<IMatriculeService, MatriculeService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAdminService, AdminService>();

        return services;
    }
}
