namespace DreamTeamEver.Api.Errors;

internal static class ApiErrorCode
{
	internal const string FieldIsRequired = "common.field_required";
	internal const string MinLengthNotReached = "common.min_length_not_reached";
	internal const string MaxLengthExceeded = "common.max_length_exceeded";
	internal const string InvalidUrl = "common.invalid_url";
	internal const string CommonUnknown = "common.unknown";

	internal const string ValidationFailedTitle = "problem.validation_title";
	internal const string ValidationFailedDetail = "problem.validation_detail";
	internal const string AccessDeniedTitle = "problem.access_denied_title";
	internal const string ForbiddenDefaultDetail = "problem.forbidden_detail";
	internal const string ResourceNotFoundTitle = "problem.not_found_title";
	internal const string ResourceNotFoundDetail = "problem.not_found_detail";
	internal const string UnauthorizedTitle = "problem.unauthorized_title";
	internal const string UnauthorizedDetail = "problem.unauthorized_detail";
	internal const string NotImplementedTitle = "problem.not_implemented_title";
	internal const string NotImplementedDetail = "problem.not_implemented_detail";
	internal const string ConfigurationErrorTitle = "problem.configuration_error_title";
	internal const string UnexpectedErrorTitle = "problem.unexpected_title";
	internal const string UnexpectedErrorDetail = "problem.unexpected_detail";
}