using DreamTeamEver.Infrastructure.Data;
using DreamTeamEver.Infrastructure.Services;

namespace DreamTeamEver.MigrationService.Services;

/// <summary>
/// Migration service for project database (DreamTeamEverDbContext)
/// </summary>
public class DreamTeamEverMigrationService : BaseMigrationService<DreamTeamEverDbContext>
{
    /// <summary>
    /// Constructor for migration service
    /// </summary>
    /// <param name="serviceProvider">Service provider</param>
    /// <param name="hostApplicationLifetime">Application lifetime</param>
    /// <param name="logger">Logger</param>
    public DreamTeamEverMigrationService(
        IServiceProvider serviceProvider,
        IHostApplicationLifetime hostApplicationLifetime,
        ILogger<DreamTeamEverMigrationService> logger)
        : base(serviceProvider, hostApplicationLifetime, logger)
    {
        
    }
}