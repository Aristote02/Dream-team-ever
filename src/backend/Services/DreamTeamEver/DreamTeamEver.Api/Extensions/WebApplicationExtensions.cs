using DreamTeamEver.Api.Configuration;
using DreamTeamEver.Api.Localization;
using DreamTeamEver.Domain.Options;
using DreamTeamEver.ServiceDefaults;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using NSwag.AspNetCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DreamTeamEver.Api.Extensions;

public static class WebApplicationExtensions
{
    /// <summary>
    /// Localization, Swagger (dev), security headers, CORS, auth, FastEndpoints, and health endpoints.
    /// </summary>
    public static WebApplication UseDreamTeamEver(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            var normalizedPath = (context.Request.Path.Value ?? string.Empty).TrimEnd('/');
            if (normalizedPath.Length == 0)
                normalizedPath = "/";

            var isHealthz = string.Equals(normalizedPath, "/healthz", StringComparison.OrdinalIgnoreCase);
            var isHealth = !app.Environment.IsDevelopment()
                && string.Equals(normalizedPath, "/health", StringComparison.OrdinalIgnoreCase);

            if (isHealthz || isHealth)
            {
                var method = context.Request.Method;
                if (HttpMethods.IsGet(method) || HttpMethods.IsHead(method))
                {
                    context.Response.StatusCode = StatusCodes.Status200OK;
                    return;
                }
            }

            await next();
        });

        var supportedCultures = new[] { "en-US", "fr-FR" };
        var localizationOptions = new RequestLocalizationOptions()
            .SetDefaultCulture(supportedCultures[0])
            .AddSupportedCultures(supportedCultures)
            .AddSupportedUICultures(supportedCultures);

        localizationOptions.RequestCultureProviders.Insert(0, new UserLanguageRequestCultureProvider());
        app.UseRequestLocalization(localizationOptions);

        var authOptions = app.Services.GetRequiredService<IOptions<AuthOptions>>().Value;

        if (app.Environment.IsDevelopment())
        {
            app.UseSwaggerGen(uiConfig: ui =>
            {
                if (!string.IsNullOrEmpty(authOptions.SwaggerClientId))
                {
                    var oauth2Client = new OAuth2ClientSettings
                    {
                        ClientId = authOptions.SwaggerClientId,
                        ClientSecret = string.Empty,
                        UsePkceWithAuthorizationCodeGrant = true
                    };
                    oauth2Client.Scopes.Add("openid");
                    oauth2Client.Scopes.Add("profile");
                    oauth2Client.Scopes.Add("email");
                    ui.OAuth2Client = oauth2Client;
                    ui.CustomInlineStyles = "div.wrapper:has(input[data-name='clientSecret']) { display: none !important; }";
                }
            });
        }

        app.UseForwardedHeaders();
        app.UseCors(DreamTeamEverCorsExtensions.AllowAllPolicy);
        
        app.UseExceptionHandler();
        app.UseProblemDetailsForStatusCodes();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseFastEndpoints(cfg =>
        {
            cfg.Serializer.Options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            cfg.Serializer.Options.PropertyNameCaseInsensitive = true;
            cfg.Serializer.Options.Converters.Add(new JsonStringEnumConverter());
            cfg.Errors.UseProblemDetails();
        });

        app.MapDefaultEndpoints();

        return app;
    }
}
