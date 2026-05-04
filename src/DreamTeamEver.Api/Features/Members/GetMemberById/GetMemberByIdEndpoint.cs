using DreamTeamEver.Api.Authorization;
using DreamTeamEver.Application.Mapping;
using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Dtos;
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
            await Send.NotFoundAsync();
            return;
        }

        if (User.IsInRole("Admin"))
        {
            await Send.OkAsync(member.ToMemberDto());
            return;
        }

        if (User.IsInRole("Member"))
        {
            var ownId = User.GetMemberId();
            if (ownId != req.Id)
            {
                await Send.ForbiddenAsync();
                return;
            }

            await Send.OkAsync(member.ToMemberDto());
            return;
        }

        await Send.ForbiddenAsync();
    }
}

public sealed record GetMemberByIdRequest(Guid Id);
