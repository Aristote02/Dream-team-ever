using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Features.Config.GetRegistrationConfig;

public sealed class GetRegistrationConfigEndpoint : EndpointWithoutRequest<RegistrationConfigDto>
{
    private readonly DreamTeamEverOptions _options;

    public GetRegistrationConfigEndpoint(IOptions<DreamTeamEverOptions> options) =>
        _options = options.Value;

    public override void Configure()
    {
        Get("/api/config/registration");
        AllowAnonymous();
        Summary(s => s.Description = "Registration fee and currency for the checkout UI (Mpesa integration pending).");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await Send.OkAsync(new RegistrationConfigDto(_options.RegistrationFee, _options.Currency), ct);
    }
}
