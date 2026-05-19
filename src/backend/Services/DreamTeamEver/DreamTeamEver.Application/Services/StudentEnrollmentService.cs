using DreamTeamEver.Application.Abstractions;
using DreamTeamEver.Application.Abstractions.Repositories;
using DreamTeamEver.Application.Configuration;
using DreamTeamEver.Application.Dtos;
using DreamTeamEver.Domain.Entities;
using DreamTeamEver.Domain.Enums;
using Microsoft.Extensions.Options;

namespace DreamTeamEver.Application.Services;

public sealed class StudentEnrollmentService : IStudentEnrollmentService
{
    private readonly IPaymentTransactionRepository _payments;
    private readonly DreamTeamEverOptions _options;

    public StudentEnrollmentService(IPaymentTransactionRepository payments, IOptions<DreamTeamEverOptions> options)
    {
        _payments = payments;
        _options = options.Value;
    }

    public async Task<PaymentType?> GetNextPaymentTypeAsync(Member member, CancellationToken cancellationToken = default)
    {
        if (await _payments.FindLatestPendingByMemberAsync(member.Id, cancellationToken) is not null)
            return null;

        if (!await IsRegistrationSatisfiedAsync(member, cancellationToken))
            return PaymentType.Registration;

        if (string.IsNullOrEmpty(member.MatriculeCode))
            return PaymentType.ScolarFee;

        if (IsScolarFeeExpired(member))
            return PaymentType.ScolarFee;

        return null;
    }

    public async Task<MemberEnrollmentStatusDto> GetStatusAsync(Member member, CancellationToken cancellationToken = default)
    {
        var registrationPaid = await IsRegistrationSatisfiedAsync(member, cancellationToken);
        var hasMatricule = !string.IsNullOrEmpty(member.MatriculeCode);
        var scolarActive = hasMatricule && !IsScolarFeeExpired(member);
        var nextType = await GetNextPaymentTypeAsync(member, cancellationToken);

        return new MemberEnrollmentStatusDto(
            registrationPaid,
            hasMatricule,
            scolarActive,
            member.ScolarFeeExpiresAt,
            nextType,
            nextType is null ? null : GetFeeAmount(nextType.Value),
            _options.Currency);
    }

    public decimal GetFeeAmount(PaymentType paymentType) =>
        paymentType switch
        {
            PaymentType.Registration => _options.RegistrationFee,
            PaymentType.ScolarFee => _options.ScolarFee,
            _ => throw new ArgumentOutOfRangeException(nameof(paymentType), paymentType, null),
        };

    public Task ExtendScolarFeeAsync(Member member, CancellationToken cancellationToken = default)
    {
        var utcNow = DateTimeOffset.UtcNow;
        var baseInstant = member.ScolarFeeExpiresAt > utcNow ? member.ScolarFeeExpiresAt.Value : utcNow;
        member.ScolarFeeExpiresAt = baseInstant.AddDays(_options.ScolarFeeValidityDays);
        return Task.CompletedTask;
    }

    private async Task<bool> IsRegistrationSatisfiedAsync(Member member, CancellationToken cancellationToken)
    {
        if (await _payments.HasCompletedPaymentAsync(member.Id, PaymentType.Registration, cancellationToken))
            return true;

        // Members who received a matricule under the previous single-fee flow.
        return !string.IsNullOrEmpty(member.MatriculeCode);
    }

    private static bool IsScolarFeeExpired(Member member) =>
        member.ScolarFeeExpiresAt is null || member.ScolarFeeExpiresAt <= DateTimeOffset.UtcNow;
}
