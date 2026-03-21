using Microsoft.AspNetCore.Mvc;
using NoteApp.Api.Exceptions;

namespace NoteApp.Api.Middlewares
{
    public class ExceptionHandlerMiddleware(RequestDelegate _next, IProblemDetailsService _problemDetailsService, ILogger<ExceptionHandlerMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception e)
            {
                logger.LogError(e,"Error Happened");
                await HandleException(context, e);
            }
        }

        public async Task HandleException(HttpContext context, Exception e)
        {
            var statusCode = e switch
            {
                ValidationException => StatusCodes.Status400BadRequest,
                NotFoundException => StatusCodes.Status404NotFound,
                UnauthorizedException => StatusCodes.Status401Unauthorized,
                _ => StatusCodes.Status500InternalServerError
            };

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = GetTitle(statusCode),
                Detail = e.Message,
                Instance = context.Request.Path
            };

            context.Response.StatusCode = statusCode;

            await _problemDetailsService.WriteAsync(new ProblemDetailsContext
            {
                HttpContext = context,
                ProblemDetails = problemDetails
            });
        }

        private string GetTitle(int statusCode)
        {
            return statusCode switch
            {
                400 => "Bad Request",
                401 => "Unauthorized",
                404 => "Not Found",
                _ => "Server Error"
            };
        }
    }
}
