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
    public class TaskItem : BaseEntity
    {
        public string Title { get; private set; }

        public string? Description { get; private set; }

        public TaskStatu Status { get; private set; }

        public TaskPriority Priority { get; private set; }

        public DateTime? DueDate { get; private set; }

        public Guid ProjectId { get; private set; }

        private readonly List<Guid> _assignedUserIds = new();

        public IReadOnlyCollection<Guid> AssignedUserIds
            => _assignedUserIds.AsReadOnly();


        // Requis par EF Core
        private TaskItem()
        {
        }


        // Création
        private TaskItem(
            Guid projectId,
            string title,
            TaskPriority priority,
            DateTime? dueDate)
        {
            if (projectId == Guid.Empty)
                throw new DomainExceptions(
                    "Le projet est obligatoire.");

            if (string.IsNullOrWhiteSpace(title))
                throw new DomainExceptions(
                    "Le titre de la tâche est obligatoire.");

            if (dueDate.HasValue &&
                dueDate.Value < DateTime.UtcNow)
            {
                throw new DomainExceptions(
                    "L'échéance ne peut pas être dans le passé.");
            }

            ProjectId = projectId;
            Title = title;
            Priority = priority;
            DueDate = dueDate;

            Status = TaskStatu.ToDo;
        }


        // Factory Method
        public static TaskItem Create(
            Guid projectId,
            string title,
            TaskPriority priority,
            DateTime? dueDate)
        {
            return new TaskItem(
                projectId,
                title,
                priority,
                dueDate);
        }


        // Assigner un utilisateur
        public void AssignTo(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new DomainExceptions(
                    "L'utilisateur est obligatoire.");

            if (_assignedUserIds.Contains(userId))
                throw new DomainExceptions(
                    "Cet utilisateur est déjà assigné à la tâche.");

            _assignedUserIds.Add(userId);
        }


        // Désassigner un utilisateur
        public void Unassign(Guid userId)
        {
            if (!_assignedUserIds.Contains(userId))
                throw new DomainExceptions(
                    "Cet utilisateur n'est pas assigné à la tâche.");

            /*
             * Décision métier :
             * on interdit de désassigner le dernier utilisateur
             * d'une tâche déjà terminée.
             */
            if (Status == TaskStatu.Done &&
                _assignedUserIds.Count == 1)
            {
                throw new DomainExceptions(
                    "Impossible de désassigner le dernier utilisateur " +
                    "d'une tâche terminée.");
            }

            _assignedUserIds.Remove(userId);
        }


        // Changer le statut
        public void MoveTo(TaskStatu newStatus)
        {
            if (!IsValidTransition(Status, newStatus))
            {
                throw new InvalidTaskTransitionException(
                    Status,
                    newStatus);
            }

            // Une tâche ne peut être terminée
            // que si elle possède au moins un utilisateur.
            if (newStatus == TaskStatu.Done &&
                !_assignedUserIds.Any())
            {
                throw new DomainExceptions(
                    "Impossible de terminer une tâche non assignée.");
            }

            Status = newStatus;
        }


        // Modifier l'échéance
        public void SetDueDate(DateTime date)
        {
            if (date < DateTime.UtcNow)
                throw new DomainExceptions(
                    "L'échéance ne peut pas être dans le passé.");

            DueDate = date;
        }


        // Machine à états
        private static bool IsValidTransition(
            TaskStatu currentStatus,
            TaskStatu newStatus)
        {
            return currentStatus switch
            {
                TaskStatu.ToDo =>
                    newStatus == TaskStatu.InProgress,

                TaskStatu.InProgress =>
                    newStatus == TaskStatu.InReview,

                TaskStatu.InReview =>
                    newStatus == TaskStatu.Done,

                TaskStatu.Done =>
                    false,

                _ => false
            };
        }
    }
}