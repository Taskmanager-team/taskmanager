using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManager.Domain.Enums
{
    public enum TaskStatu
    {
        ToDo,
        InProgress,
        Done,
        InReview
    }
    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Urgent
    }
    public enum WorkspaceRole
    {
        Admin,
        ProjectManager,
        Member
    }
    public enum ProjectStatus
    {
        NotStarted,
        InProgress,
        Completed,
        OnHold,
        Cancelled, Active,
        Archived
    }
    public enum NotificationType
{
    TaskAssigned,
    TaskSubmitted,
    TaskApproved,
    TaskRejected,
    TaskDueSoon,
    ProjectCreated,
    ProjectMemberAdded
}
 

}
