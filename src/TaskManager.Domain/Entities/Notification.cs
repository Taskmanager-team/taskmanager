using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Entities
{
    public class Notification : BaseEntity
    {
        public Guid UserId { get; private set; }

        public string Title { get; private set; }

        public string Message { get; private set; }

        public NotificationType Type { get; private set; }

        public bool IsRead { get; private set; }

        public Guid? TaskId { get; private set; }

        public Guid? ProjectId { get; private set; }

        public DateTime CreatedAt { get; private set; }




        private Notification()
        {
        }

        private Notification(
            Guid userId,
            string message)
        {
            if (userId == Guid.Empty)
                throw new DomainExceptions(
                    "UserId est obligatoire.");

            if (string.IsNullOrWhiteSpace(message))
                throw new DomainExceptions(
                    "Le message de la notification est obligatoire.");

            UserId = userId;
            Message = message.Trim();
            IsRead = false;
        }

        public static Notification Create(
            Guid userId,
            string message)
        {
            return new Notification(
                userId,
                message);
        }

        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
   
}
