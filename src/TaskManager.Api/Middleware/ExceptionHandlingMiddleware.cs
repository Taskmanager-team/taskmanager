using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        var traceId = context.TraceIdentifier;

        ProblemDetails problemDetails = exception switch
        {
            NotFoundException notFoundException =>
                CreateProblem(
                    StatusCodes.Status404NotFound,
                    "Resource not found",
                    notFoundException.Message,
                    context,
                    traceId),

            ForbiddenException forbiddenException =>
                CreateProblem(
                    StatusCodes.Status403Forbidden,
                    "Access denied",
                    forbiddenException.Message,
                    context,
                    traceId),

            DomainExceptions domainException =>
                CreateProblem(
                    StatusCodes.Status422UnprocessableEntity,
                    "Business rule violation",
                    domainException.Message,
                    context,
                    traceId),

            ValidationException validationException =>
                CreateValidationProblem(
                    validationException,
                    context,
                    traceId),

            _ => CreateUnexpectedProblem(
                exception,
                context,
                traceId)
        };

        context.Response.StatusCode = problemDetails.Status
            ?? StatusCodes.Status500InternalServerError;

        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(problemDetails);
    }

    private static ProblemDetails CreateProblem(
        int status,
        string title,
        string detail,
        HttpContext context,
        string traceId)
    {
        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = traceId;

        return problem;
    }

    private static ValidationProblemDetails CreateValidationProblem(
        ValidationException exception,
        HttpContext context,
        string traceId)
    {
        var errors = exception.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group
                    .Select(error => error.ErrorMessage)
                    .ToArray());

        var problem = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation failed",
            Detail = "One or more validation errors occurred.",
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = traceId;

        return problem;
    }

    private ProblemDetails CreateUnexpectedProblem(
        Exception exception,
        HttpContext context,
        string traceId)
    {
        _logger.LogError(
            exception,
            "Unhandled exception. TraceId: {TraceId}",
            traceId);

        return CreateProblem(
            StatusCodes.Status500InternalServerError,
            "Internal server error",
            "An unexpected error occurred. Contact support with the traceId.",
            context,
            traceId);
    }
}
