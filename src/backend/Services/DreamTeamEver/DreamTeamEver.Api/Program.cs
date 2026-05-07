using DreamTeamEver.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddDreamTeamEver();

var app = builder.Build();

app.UseDreamTeamEver();

app.MapHealthChecks("/healthz");

app.Run();
