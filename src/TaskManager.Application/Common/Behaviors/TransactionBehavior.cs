using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.Common.Messaging;

namespace TaskManager.Application.Common.Behaviors;

public sealed class TransactionBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IApplicationDbContext _dbContext;

    public TransactionBehavior(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Une query ne modifie rien : pas de transaction.
        if (request is not ICommand<TResponse>)
        {
            return await next();
        }

        // Une command modifie la base : on démarre une transaction.
        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var response = await next();

            // Tout a fonctionné : on sauvegarde définitivement.
            await transaction.CommitAsync(cancellationToken);

            return response;
        }
        catch
        {
            // Une erreur : on annule toutes les écritures.
            await transaction.RollbackAsync(cancellationToken);

            throw;
        }
    }
}