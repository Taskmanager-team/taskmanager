using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManager.Domain.Exceptions
{
    public class DomainExceptions : Exception
    {
        public DomainExceptions(string message) : base(message)
        {
        }
    }

}
