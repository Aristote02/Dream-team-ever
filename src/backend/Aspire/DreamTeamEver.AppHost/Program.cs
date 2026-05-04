var builder = DistributedApplication.CreateBuilder(args);

var pgUsername = builder.AddParameter("pg-username", true);
var pgPassword = builder.AddParameter("pg-password", true);

// Add Postgres
#if DEBUG
var pgPort = 5432;
#else
int pgPort = 5435;
#endif

var dreamTeamEverDb = builder
    .AddPostgres("postgres", pgUsername, pgPassword, port: pgPort)
    .WithPgAdmin()
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent)
    .AddDatabase("DreamTeamEverDbConnectionString", "DreamTeamEver");

// Add Redis cache
var redis = builder
    .AddRedis("RedisConnectionString")
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent);

// Add migration service for project database
var projectDbMigrator = builder.AddProject<Projects.DreamTeamEver_MigrationService>("dream-team-ever-migrator")
    .WithReference(dreamTeamEverDb)
    .WaitFor(dreamTeamEverDb);

// Add API (wait for migrator so schema exists — avoids API startup deadlocks / racing Migrate)
var dreamTeamEverApi = builder.AddProject<Projects.DreamTeamEver_Api>("dream-team-ever-api")
    .WithReference(dreamTeamEverDb)
    .WithReference(redis)
    .WaitFor(projectDbMigrator)
    .WithEndpoint("http", endpoint =>
    {
        endpoint.Port = 5262;
        endpoint.UriScheme = "http";
    })
    .WithEndpoint("https", endpoint =>
    {
        endpoint.Port = 7212;
        endpoint.UriScheme = "https";
    });

 builder.AddNpmApp("dreamTeamEver-web", "../../../frontend/DreamTeamEver.Web")
    .WithReference(dreamTeamEverApi)
    .WithHttpEndpoint(port: 40002, targetPort: 4000, name: "frontend", env: "PORT");

builder.Build().Run();
