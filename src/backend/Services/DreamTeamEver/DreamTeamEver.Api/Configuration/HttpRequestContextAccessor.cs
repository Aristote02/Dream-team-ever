using DreamTeamEver.Application.Abstractions;

namespace DreamTeamEver.Api.Configuration;

internal sealed class HttpRequestContextAccessor : IRequestContextAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpRequestContextAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public RequestContext GetCurrent()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var ip = httpContext?.Connection.RemoteIpAddress?.ToString();
        var userAgent = httpContext?.Request.Headers.UserAgent.ToString();
        return new RequestContext(ip, userAgent);
    }
}
