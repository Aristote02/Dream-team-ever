using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;

namespace DreamTeamEver.Application.Abstractions;

public interface IStudentEnrollmentService
{
    Task<PaymentType?> GetNextPaymentTypeAsync(Member member, CancellationToken cancellationToken = default);

    Task<MemberEnrollmentStatusDto> GetStatusAsync(Member member, CancellationToken cancellationToken = default);

    decimal GetFeeAmount(PaymentType paymentType);

    Task ExtendScolarFeeAsync(Member member, CancellationToken cancellationToken = default);
}
