using DreamTeamEver.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddDreamTeamEver();

var app = builder.Build();

app.MapHealthChecks("/healthz");

app.UseDreamTeamEver();

app.Run();
