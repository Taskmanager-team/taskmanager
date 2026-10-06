using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Infrastructure.Identity;

namespace TaskManager.Infrastructure.Persistence.Seed
{
    public static class DataSeeder
    {
        private const string SeedWorkspaceName = "Workspace Démo";
        private const string DemoPassword = "Demo@1234";
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var alreadySeeded = await context.Workspaces.AnyAsync(w => w.Name == SeedWorkspaceName);
            if (alreadySeeded)
            {
                return ;
            }
            var khaled = await CreateDemoUserAsync(
                userManager,
                unitOfWork,
                "khaled@demo.net",
                "khaled",
                "mahroug"
            ) ;
            var abdessamad = await CreateDemoUserAsync(
                userManager,
                unitOfWork,
                "abdessamad@demo.net",
                "abdessamad",
                "elgahs"
            ) ;
            var salah = await CreateDemoUserAsync(
                userManager,
                unitOfWork,
                "salah@demo.net",
                "salah",
                "kissi"
            ) ;
            await unitOfWork.SaveChangesAsync();
            

            var workspace = new Workspace(SeedWorkspaceName,khaled.Id,"Workspace de démonstration pour le Kanban");
            workspace.InviteMember(abdessamad.Id,WorkspaceRole.ProjectManager);
            workspace.InviteMember(salah.Id,WorkspaceRole.Member);

            await unitOfWork.Workspaces.AddAsync(workspace);
            await unitOfWork.SaveChangesAsync();


            var projectWeb = Project.Create(workspace.Id, "Refonte Site Web", "Modernisation du site vitrine de l'entreprise.");
            var projectMobile = Project.Create(workspace.Id, "Application Mobile", "Développement de l'application compagnon iOS/Android.");

            await unitOfWork.Projects.AddAsync(projectWeb);
            await unitOfWork.Projects.AddAsync(projectMobile);
            await unitOfWork.SaveChangesAsync();



            var userIds = new[] { khaled.Id, abdessamad.Id, salah.Id };
            var projects = new[] { projectWeb, projectMobile };
            var random = new Random(42); // seed fixe pour un résultat reproductible

            var statusCycle = new[] { TaskStatu.ToDo, TaskStatu.InProgress, TaskStatu.InReview, TaskStatu.Done };
            var priorityCycle = new[] { TaskPriority.Low, TaskPriority.Medium, TaskPriority.High, TaskPriority.Urgent };

            var titles = new[]
            {
                "Mettre en place le design system", "Corriger le bug d'affichage mobile",
                "Ecrire les tests unitaires du panier", "Optimiser le temps de chargement",
                "Intégrer la page de connexion", "Revoir l'ergonomie du formulaire de contact",
                "Ajouter le mode sombre", "Mettre à jour les dépendances npm",
                "Rédiger la documentation API", "Configurer le pipeline CI/CD",
                "Implémenter la recherche full-text", "Corriger les problèmes d'accessibilité",
                "Ajouter les notifications push", "Mettre en place le cache Redis",
                "Créer le tableau de bord analytique", "Sécuriser les endpoints sensibles",
                "Ajouter la pagination sur la liste", "Refactorer le service d'authentification",
                "Préparer la démo client", "Corriger les fuites mémoire",
                "Ajouter les tests end-to-end", "Mettre à jour le schéma de base de données",
                "Améliorer les messages d'erreur", "Internationaliser l'interface",
                "Optimiser les requêtes SQL lentes", "Ajouter l'export PDF des rapports"
            };

            var createdTasks = new List<TaskItem>();
            var taskCount = Math.Min(titles.Length, 26); // reste dans la fourchette 20-30

            for (int i = 0; i < taskCount; i++)
            {
                var project = projects[i % projects.Length];
                var priority = priorityCycle[random.Next(priorityCycle.Length)];
                var dueDate = DateTime.UtcNow.AddDays(random.Next(3, 45));

                var task = TaskItem.Create(project.Id, titles[i], priority, dueDate);

                // Assignation à 1 ou 2 utilisateurs aléatoires
                var assigneeCount = random.Next(1, 3);
                var shuffledUsers = userIds.OrderBy(_ => random.Next()).Take(assigneeCount);
                foreach (var userId in shuffledUsers)
                {
                    task.AssignTo(userId);
                }

                // Répartit les tâches sur les 4 colonnes du Kanban
                var targetStatus = statusCycle[i % statusCycle.Length];
                AdvanceToStatus(task, targetStatus);

                await unitOfWork.Tasks.AddAsync(task);
                createdTasks.Add(task);
            }

            await unitOfWork.SaveChangesAsync();

            // ---------- 5. Commentaires ----------
            var commentTexts = new[]
            {
                "Je m'en occupe cette semaine.",
                "Bloqué par la tâche précédente, je reviens vers vous.",
                "Peux-tu valider ce point avant la mise en production ?",
                "Bon travail, rien à ajouter.",
                "Il faudra prévoir un test de charge sur ce point.",
                "Discuté en réunion, on garde cette approche."
            };

            var tasksWithComments = createdTasks.OrderBy(_ => random.Next()).Take(Math.Min(6, createdTasks.Count));
            foreach (var task in tasksWithComments)
            {
                var author = userIds[random.Next(userIds.Length)];
                var text = commentTexts[random.Next(commentTexts.Length)];

                task.AddComment(text, author);
            }

            await unitOfWork.SaveChangesAsync();

            

        }
        private static async Task<User> CreateDemoUserAsync
        (
            UserManager<ApplicationUser> UserManager,
            IUnitOfWork unitOfWork,
            string email,
            string firstname,
            string lastname
        )
        {
            var IdentityUser = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = firstname,
                LastName = lastname
            };
            await UserManager.CreateAsync(IdentityUser,DemoPassword);
            var domainUser = User.Create(IdentityUser.Id,firstname,lastname,email);
            await unitOfWork.Users.AddAsync(domainUser) ;
            return domainUser ;
        }
        private static void AdvanceToStatus(TaskItem task, TaskStatu targetStatus)
        {
            var order = new[] { TaskStatu.ToDo, TaskStatu.InProgress, TaskStatu.InReview, TaskStatu.Done };
            var targetIndex = Array.IndexOf(order, targetStatus);

            for (int step = 1; step <= targetIndex; step++)
            {
                task.MoveTo(order[step]);
            }
        }
    }
}