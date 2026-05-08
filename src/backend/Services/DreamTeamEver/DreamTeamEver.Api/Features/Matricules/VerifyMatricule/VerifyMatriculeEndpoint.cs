using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Matricules.VerifyMatricule;

public sealed class VerifyMatriculeEndpoint : Endpoint<VerifyMatriculeRequest, MatriculeVerificationDto>
{
    private readonly IMatriculeService _matricules;

    public VerifyMatriculeEndpoint(IMatriculeService matricules) => _matricules = matricules;

    public override void Configure()
    {
        Get("/api/matricules/verify");
        AllowAnonymous();
        Summary(s => s.Description = "Public verification: confirms a matricule exists and returns the holder name.");
    }

    public override async Task HandleAsync(VerifyMatriculeRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Code))
        {
            await Send.OkAsync(new MatriculeVerificationDto(false, null, null), ct);
            return;
        }

        var member = await _matricules.FindByMatriculeAsync(req.Code, ct);
        if (member is null)
        {
            await Send.OkAsync(new MatriculeVerificationDto(false, null, null), ct);
            return;
        }

        await Send.OkAsync(new MatriculeVerificationDto(true, member.FullName, member.MatriculeIssuedAt), ct);
    }
}
