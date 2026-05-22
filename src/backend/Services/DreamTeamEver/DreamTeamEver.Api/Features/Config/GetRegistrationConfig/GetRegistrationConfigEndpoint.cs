using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Api.Features.Config.GetRegistrationConfig;

public sealed class GetRegistrationConfigEndpoint : EndpointWithoutRequest<RegistrationConfigDto>
{
    private readonly DreamTeamEverOptions _options;
    private readonly MpesaOptions _mpesa;
    private readonly IWebHostEnvironment _env;

    public GetRegistrationConfigEndpoint(IOptions<DreamTeamEverOptions> options, IOptions<MpesaOptions> mpesa, IWebHostEnvironment env)
    {
        _options = options.Value;
        _mpesa = mpesa.Value;
        _env = env;
    }

    public override void Configure()
    {
        Get("/api/config/registration");
        AllowAnonymous();
        Summary(s => s.Description = "Registration and scolar fees for the checkout UI.");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var allowSimulation = _options.AllowPaymentSimulation || _env.IsDevelopment();
        
        await Send.OkAsync(new RegistrationConfigDto(_options.RegistrationFee, _options.ScolarFee, _options.ScolarFeeValidityDays, _options.Currency, allowSimulation, _mpesa.Enabled), ct);
    }
}
