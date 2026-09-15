using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Exceptions
{
   
        public class InvalidTaskTransitionException : DomainExceptions
        {
            public InvalidTaskTransitionException(
                TaskStatu currentStatus,
                TaskStatu newStatus)
                : base(
                    $"Transition impossible : {currentStatus} -> {newStatus}.")
            {
            }
        }
    }
