using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace TaskManager.Application.Common.Messaging
{
    public interface ICommand<out TResponse> : IRequest<TResponse>
    {
    }
}
