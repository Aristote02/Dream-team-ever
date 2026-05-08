using DreamTeamEver.Api.Extensions;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.AddDreamTeamEver();

var app = builder.Build();

/*app.MapHealthChecks("/healthz", new HealthCheckOptions
{
    Predicate = r => r.Tags.Contains("live")
});*/

app.MapGet("/healthz", () => Results.Ok("Healthy"));

app.UseDreamTeamEver();

app.Run();
