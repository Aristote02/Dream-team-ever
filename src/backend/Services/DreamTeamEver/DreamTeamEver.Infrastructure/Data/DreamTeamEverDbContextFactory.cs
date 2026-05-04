using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DreamTeamEver.Infrastructure.Data;

/// <summary>Design-time factory for <c>dotnet ef</c> (connection string from env or local dev default).</summary>
public sealed class DreamTeamEverDbContextFactory : IDesignTimeDbContextFactory<DreamTeamEverDbContext>
{
    public DreamTeamEverDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DreamTeamEverDbConnectionString")
            ?? "Host=localhost;Port=5432;Database=DreamTeamEver;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<DreamTeamEverDbContext>();
        optionsBuilder.UseNpgsql(connectionString);
        return new DreamTeamEverDbContext(optionsBuilder.Options);
    }
}
