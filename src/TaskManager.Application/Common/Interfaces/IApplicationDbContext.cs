using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace TaskManager.Application.Common.Interfaces
{
    public  interface IApplicationDbContext
    {
        DatabaseFacade Database { get; }
    }
}
