namespace DreamTeamEver.Api.Errors;

internal static class ApiErrorCatalog
{
	private static readonly IReadOnlyDictionary<string, string> ResourceKeys = new Dictionary<string, string>
	{
		[ApiErrorCode.FieldIsRequired] = "FieldIsRequired",
		[ApiErrorCode.MinLengthNotReached] = "MinLengthNotReached",
		[ApiErrorCode.MaxLengthExceeded] = "MaxLengthExceeded",
		[ApiErrorCode.InvalidUrl] = "InvalidUrl",
		[ApiErrorCode.CommonUnknown] = "CommonUnknown",

		[ApiErrorCode.ValidationFailedTitle] = "ValidationFailedTitle",
		[ApiErrorCode.ValidationFailedDetail] = "ValidationFailedDetail",
		[ApiErrorCode.AccessDeniedTitle] = "AccessDeniedTitle",
		[ApiErrorCode.ForbiddenDefaultDetail] = "ForbiddenDefaultDetail",
		[ApiErrorCode.ResourceNotFoundTitle] = "ResourceNotFoundTitle",
		[ApiErrorCode.ResourceNotFoundDetail] = "ResourceNotFoundDetail",
		[ApiErrorCode.UnauthorizedTitle] = "UnauthorizedTitle",
		[ApiErrorCode.UnauthorizedDetail] = "UnauthorizedDetail",
		[ApiErrorCode.NotImplementedTitle] = "NotImplementedTitle",
		[ApiErrorCode.NotImplementedDetail] = "NotImplementedDetail",
		[ApiErrorCode.ConfigurationErrorTitle] = "ConfigurationErrorTitle",
		[ApiErrorCode.UnexpectedErrorTitle] = "UnexpectedErrorTitle",
		[ApiErrorCode.UnexpectedErrorDetail] = "UnexpectedErrorDetail",
    };

	internal static string GetResourceKey(string code)
	{
		if (ResourceKeys.TryGetValue(code, out var resourceKey))
		{
			return resourceKey;
		}

		return code;
	}

	internal static bool ContainsCode(string code)
	{
		return ResourceKeys.ContainsKey(code);
	}
}