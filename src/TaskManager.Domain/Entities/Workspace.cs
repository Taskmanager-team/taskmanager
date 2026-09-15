using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Entities
{
    public class Workspace : BaseEntity
    {
        public string Name { get; private set; }
        public string? Description { get; private set; }

        public Guid OwnerId { get; private set; }

        public ICollection<Project> Projects { get; private set; }
            = new List<Project>();

        public ICollection<WorkspaceMember> Members { get; private set; }
            = new List<WorkspaceMember>();
  
    // Constructeur utilisé par EF Core
        private Workspace()
        {
        }

        // Constructeur métier
        public Workspace(
            string name,
            Guid ownerId,
            string? description = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new DomainExceptions("Workspace name is required.");

            if (ownerId == Guid.Empty)
                throw new DomainExceptions("OwnerId is required.");

            Name = name;
            Description = description;
            OwnerId = ownerId;
        }

        // Ajouter un membre
        public void InviteMember(
            Guid userId,
            WorkspaceRole role)
        {
            if (userId == Guid.Empty)
                throw new DomainExceptions("UserId is required.");

            // Le propriétaire ne peut pas être invité
            if (userId == OwnerId)
                throw new DomainExceptions(
                    "The workspace owner cannot be invited.");

            // Vérifier si l'utilisateur existe déjà
            if (Members.Any(m => m.UserId == userId))
                throw new DomainExceptions(
                    "The user is already a member of this workspace.");

            var member = new WorkspaceMember(
                Id,
                userId,
                role);

            Members.Add(member);
        }

        // Modifier le rôle d'un membre
        public void ChangeMemberRole(
            Guid userId,
            WorkspaceRole newRole)
        {
            var member = Members.FirstOrDefault(m => m.UserId == userId);

            if (member == null)
                throw new DomainExceptions(
                    "The user is not a member of this workspace.");

            // Si l'utilisateur est le dernier Admin,
            // il ne peut pas perdre son rôle Admin.
            if (member.Role == WorkspaceRole.Admin &&
                newRole != WorkspaceRole.Admin)
            {
                var adminCount = Members.Count(
                    m => m.Role == WorkspaceRole.Admin);

                if (adminCount <= 1)
                    throw new DomainExceptions(
                        "A workspace must always have at least one Admin.");
            }

            member.ChangeRole(newRole);
        }
    } }

