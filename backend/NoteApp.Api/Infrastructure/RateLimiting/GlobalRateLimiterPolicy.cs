using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Threading.RateLimiting;

namespace NoteApp.Api.Infrastructure.RateLimiting
{
    public class GlobalRateLimiterPolicy : IRateLimiterPolicy<string>
    {
        public Func<OnRejectedContext, CancellationToken, ValueTask>? OnRejected => async (context, _) =>
        {
            context.HttpContext.Response.StatusCode = 429;
            if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            {
                await context.HttpContext.Response.WriteAsync(
                    $"Too many requests. Please try again after {retryAfter.TotalMinutes} minute(s). ");
            }
            else
            {
                await context.HttpContext.Response.WriteAsync(
                    $"Too many requests. Please try again later. ");
            }
        };

        public RateLimitPartition<string> GetPartition(HttpContext httpContext)
        {
            if (httpContext.User.Identity?.IsAuthenticated == true)
            {
                return RateLimitPartition.GetFixedWindowLimiter(httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)!,
                    partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1)
                    });
            }

            return RateLimitPartition.GetFixedWindowLimiter(httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = 50,
                        Window = TimeSpan.FromMinutes(1)
                    });
        }
    }
}
