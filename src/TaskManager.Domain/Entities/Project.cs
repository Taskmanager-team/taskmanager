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
    public class Project : BaseEntity
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

       

    // Constructeur privé pour EF Core
        private Project()
        {
        }

        // Création
        public static Project Create(
            Guid workspaceId,
            string name,
            string? description)
        {
            if (workspaceId == Guid.Empty)
                throw new ArgumentException(
                    "WorkspaceId est obligatoire.");

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(
                    "Le nom du projet est obligatoire.");

            return new Project
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                Name = name.Trim(),
                Description = description,
                Status = ProjectStatus.Active
            };
        }

        // Renommer verification si le nom existe deja n'est pas fait ici encoure 
        public void Rename(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(
                    "Le nom du projet ne peut pas être vide.");
           

            Name = name.Trim();
        }

        public TaskItem CreateTask(
            string title,
            TaskPriority priority,
            DateTime? dueDate)
        {
            if (Status == ProjectStatus.Archived)
                throw new DomainExceptions(
                    "Impossible de créer une tâche dans un projet archivé.");

            var task = TaskItem.Create(Id, title, priority, dueDate);
            Tasks.Add(task);
            return task;
        }

        // Archiver
        public void Archive()
        {
            if (Status == ProjectStatus.Archived)
                return;

            Status = ProjectStatus.Archived;
        }

        // Désarchiver
        public void Unarchive()
        {
            if (Status == ProjectStatus.Active)
                return;

            Status = ProjectStatus.Active;
        }

        
    }
}


