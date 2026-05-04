using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Data.Seeding;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        IUserRepository users,
        IPasswordHasher<User> passwordHasher,
        IOptions<AdminSeedOptions> seedOptions,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var opts = seedOptions.Value;
        if (!opts.Enabled)
            return;

        if (await users.AnyInRoleAsync(UserRole.Admin, cancellationToken))
            return;

        var email = opts.Email.Trim();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Role = UserRole.Admin,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, opts.Password);

        await users.AddAsync(user, cancellationToken);
        await users.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded admin user {Email}.", email);
    }
}
