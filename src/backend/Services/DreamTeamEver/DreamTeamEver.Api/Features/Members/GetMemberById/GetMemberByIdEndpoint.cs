using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Enums;
using FastEndpoints;

namespace DreamTeamEver.Api.Features.Members.GetMemberById;

public sealed class GetMemberByIdEndpoint : Endpoint<GetMemberByIdRequest, MemberDto>
{
    private readonly IMemberService _members;

    public GetMemberByIdEndpoint(IMemberService members) => _members = members;

    public override void Configure()
    {
        Get("/api/members/{Id}");
    }

    public override async Task HandleAsync(GetMemberByIdRequest req, CancellationToken ct)
    {
        var member = await _members.GetByIdAsync(req.Id, ct);
        if (member is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        if (User.IsInRole(nameof(UserRole.Admin)))
        {
            await Send.OkAsync(member.ToMemberDto(), ct);
            return;
        }

        if (User.IsInRole(nameof(UserRole.Member)))
        {
            var ownId = User.GetMemberId();
            if (ownId != req.Id)
            {
                await Send.ForbiddenAsync(ct);
                return;
            }

            await Send.OkAsync(member.ToMemberDto(), ct);
            return;
        }

        await Send.ForbiddenAsync(ct);
    }
}
