using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using DreamTeamEver.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Infrastructure.Seeding;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        AppDbContext db,
        IPasswordHasher<User> passwordHasher,
        IOptions<AdminSeedOptions> seedOptions,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var opts = seedOptions.Value;
        if (!opts.Enabled)
            return;

        if (await db.Users.AnyAsync(u => u.Role == UserRole.Admin, cancellationToken))
            return;

        var email = opts.Email.Trim();
        var user = new User
        {
            Email = email,
            Role = UserRole.Admin,
            CreatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, opts.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded admin user {Email}.", email);
    }
}
