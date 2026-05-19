using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Members.GetMe;

/// <summary>Current member profile (Member role).</summary>
public sealed class GetMeEndpoint : EndpointWithoutRequest<MemberDto>
{
    private readonly IMemberService _members;
    private readonly IStudentEnrollmentService _enrollment;

    public GetMeEndpoint(IMemberService members, IStudentEnrollmentService enrollment)
    {
        _members = members;
        _enrollment = enrollment;
    }

    public override void Configure()
    {
        Get("/api/members/me");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var member = await _members.GetByUserIdAsync(userId, ct);
        if (member is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var status = await _enrollment.GetStatusAsync(member, ct);
        await Send.OkAsync(member.ToMemberDto(status), ct);
    }
}
