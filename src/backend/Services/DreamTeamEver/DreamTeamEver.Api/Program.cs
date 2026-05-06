using DreamTeamEver.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddDreamTeamEver();

var app = builder.Build();

app.MapGet("/healthz", () => Results.Ok("healthy"));

// app.MapHealthChecks("/healthz");

app.UseDreamTeamEver();

app.Run();
