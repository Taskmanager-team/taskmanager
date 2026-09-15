using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Entities
{
    internal public class Project : BaseEntity
    {
        public string Name { get; private set; }
        public string? Description { get; private set; }

        public ProjectStatus Status { get; private set; }

        public DateTime? StartDate { get; private set; }
        public DateTime? EndDate { get; private set; }

        public Guid WorkspaceId { get; private set; }

        public Guid ProjectManagerId { get; private set; }

        public ICollection<TaskItem> Tasks { get; private set; }
            = new List<TaskItem>();
    }
}
