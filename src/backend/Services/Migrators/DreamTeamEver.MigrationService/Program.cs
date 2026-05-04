using DreamTeamEver.Domain.Options;
using DreamTeamEver.Infrastructure.Data;
using DreamTeamEver.MigrationService.Services;
using DreamTeamEver.ServiceDefaults;

var builder = Host.CreateApplicationBuilder(args);

builder.SetupDefaults(args);
builder.Services.AddOptionsWithBaseValidationOnStart<ConnectionStringsOptions>(builder.Configuration, x => x.DreamTeamEverDbConnectionString);
builder.AddDatabase<DreamTeamEverDbContext, ConnectionStringsOptions>(x => x.DreamTeamEverDbConnectionString, "DreamTeamEver.Infrastructure");

// Register our new service as Hosted Service
builder.Services.AddHostedService<DreamTeamEverMigrationService>();

var host = builder.Build();
host.Run();