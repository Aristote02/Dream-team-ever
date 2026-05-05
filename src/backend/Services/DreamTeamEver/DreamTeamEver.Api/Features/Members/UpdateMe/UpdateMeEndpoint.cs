using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Members.UpdateMe;

public sealed class UpdateMeEndpoint : Endpoint<UpdateMyProfileRequest, MemberDto>
{
    private readonly IMemberService _members;

    public UpdateMeEndpoint(IMemberService members) => _members = members;

    public override void Configure()
    {
        Put("/api/members/me");
    }

    public override async Task HandleAsync(UpdateMyProfileRequest req, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var member = await _members.UpdateMyProfileAsync(userId, req.FullName, req.Phone, ct);
        if (member is null)
            return;

        await Send.OkAsync(member.ToMemberDto(), ct);
    }
}
