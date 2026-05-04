using DreamTeamEver.Domain.Options;
using FastEndpoints.Swagger;
using NSwag;
using NSwag.Generation.Processors;
using NSwag.Generation.Processors.Contexts;

namespace DreamTeamEver.Api.Configuration;

public static class SwaggerConfiguration
{
    public static IServiceCollection ConfigureSwagger(this IServiceCollection services, IConfiguration configuration)
    {
        var authOptions = configuration.GetSection(AuthOptions.SectionName).Get<AuthOptions>() ?? new AuthOptions();

        services.SwaggerDocument(o =>
        {
            o.EnableJWTBearerAuth = false;

            o.DocumentSettings = s =>
            {
                s.Title = "Dream Team Ever API";
                s.Version = "v1";
                s.OperationProcessors.Add(new UserLanguageHeaderOperationProcessor());

                if (!string.IsNullOrEmpty(authOptions.SwaggerClientId) && !string.IsNullOrWhiteSpace(authOptions.Authority))
                {
                    var authority = authOptions.Authority.TrimEnd('/');
                    s.AddSecurity("oauth2", new[] { "openid", "profile", "email" }, new OpenApiSecurityScheme
                    {
                        Type = OpenApiSecuritySchemeType.OAuth2,
                        Description = "OAuth2 (Authorization Code + PKCE)",
                        Flows = new OpenApiOAuthFlows
                        {
                            AuthorizationCode = new OpenApiOAuthFlow
                            {
                                AuthorizationUrl = $"{authority}/authorize",
                                TokenUrl = $"{authority}/oauth/token",
                                Scopes = new Dictionary<string, string>
                                {
                                    { "openid", "OpenID Connect" },
                                    { "profile", "Profile" },
                                    { "email", "Email" }
                                }
                            }
                        }
                    });
                }
            };
        });

        return services;
    }
}

internal sealed class UserLanguageHeaderOperationProcessor : IOperationProcessor
{
    public bool Process(OperationProcessorContext context)
    {
        context.OperationDescription.Operation.Parameters.Add(new NSwag.OpenApiParameter
        {
            Name = "User-Language",
            Kind = OpenApiParameterKind.Header,
            Schema = new NJsonSchema.JsonSchema { Type = NJsonSchema.JsonObjectType.String, Enumeration = { "en", "fr" } },
            IsRequired = false,
            Default = "en",
            Description = "Response language (en / fr)"
        });
        return true;
    }
}
