using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Common;

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
    }
}
