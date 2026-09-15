using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Entities
{
    public class WorkspaceMember
    {
        public Guid WorkspaceId { get; private set; }

        public Guid UserId { get; private set; }

        public WorkspaceRole Role { get; private set; }
    }
    private WorkspaceMember() { } // requis par EF Core

        public WorkspaceMember(Guid workspaceId, Guid userId, WorkspaceRole role)
        {
            if (workspaceId == Guid.Empty)
                throw new DomainExceptions("WorkspaceId is required.");

            if (userId == Guid.Empty)
                throw new DomainExceptions("UserId is required.");

            WorkspaceId = workspaceId;
            UserId = userId;
            Role = role; }
    public void ChangeRole(WorkspaceRole role)
        {
            Role = role;
        }
    }
    } 

