using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Exceptions;

namespace NoteApp.Api.Middlewares
{
    public class ExceptionHandlerMiddleware(RequestDelegate _next, ILogger<ExceptionHandlerMiddleware> logger)
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
            var response = new ResponseViewModel
            {
                Success = false,
                Message = "An unexpected error occurred",
                Error = new ErrorViewModel
                {
                    Code = "SERVER_ERROR"
                }
            };

            switch(e)
            {
                case ValidationException:
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    response.Message = e.Message;
                    response.Error.Code = "INPUT_VALIDATION_ERROR";
                    break;

                case UnauthorizedException:
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    response.Message = e.Message;
                    response.Error.Code = "UNAUTHORIZED";
                    break;

                case NotFoundException:
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    response.Message = e.Message;
                    response.Error.Code = "NOT_FOUND";
                    break;

                case UserAlreadyExistsException:
                    context.Response.StatusCode = StatusCodes.Status409Conflict;
                    response.Message = e.Message;
                    response.Error.Code = "CONFLICT";
                    break;

                default:
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    break;
            }

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
