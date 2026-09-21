using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Persistence.Configuration
{
    public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Description).HasMaxLength(500);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(t => t.ProjectId);
        builder.HasIndex(t => t.Status);

        // Mappe la liste de Guid vers une vraie table de jointure
       // ✅ Fonctionne — mappe une collection de types primitifs directement
        builder.PrimitiveCollection<List<Guid>>("_assignedUserIds")
            .HasColumnName("AssignedUserIds");
    }
}
}