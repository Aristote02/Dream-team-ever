using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Infrastructure.Data.Seeding;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Hosting;

/// <summary>
/// Runs admin seeding asynchronously after the host starts. Database schema is applied by <see cref="DreamTeamEver.MigrationService"/> (Aspire), not the API.
/// </summary>
internal sealed class AdminSeedHostedService : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AdminSeedHostedService> _logger;

    public AdminSeedHostedService(IServiceScopeFactory scopeFactory, ILogger<AdminSeedHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var sp = scope.ServiceProvider;
            var users = sp.GetRequiredService<IUserRepository>();
            var passwordHasher = sp.GetRequiredService<IPasswordHasher<User>>();
            var seedOptions = sp.GetRequiredService<IOptions<AdminSeedOptions>>();
            await AdminSeeder.SeedAsync(users, passwordHasher, seedOptions, _logger, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin seed failed.");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
