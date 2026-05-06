namespace DreamTeamEver.Application.Dtos;

public sealed class GetAllPaymentsRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 25;
}
