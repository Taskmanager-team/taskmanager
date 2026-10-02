using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace TaskManager.Application.Common.Behaviors
{
    public sealed class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(
       ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }
        public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;

            var correlationId = Activity.Current?.TraceId.ToString()
                                ?? Guid.NewGuid().ToString("N");

            var stopwatch = Stopwatch.StartNew();

            try
            {
                var result = await next();

                _logger.LogInformation(
                    "Request {RequestName} succeeded in {DurationMs} ms. CorrelationId: {CorrelationId}",
                    requestName,
                    stopwatch.ElapsedMilliseconds,
                    correlationId);

                return result;
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Request {RequestName} failed after {DurationMs} ms. CorrelationId: {CorrelationId}",
                    requestName,
                    stopwatch.ElapsedMilliseconds,
                    correlationId);

                throw;
            }
        }
}
}
