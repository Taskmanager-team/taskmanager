using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Persistence.Configuration
{
    public class WorkspaceMemberConfiguration : IEntityTypeConfiguration<WorkspaceMember>
    {
        public void Configure(EntityTypeBuilder<WorkspaceMember> builder)
        {
            builder.HasKey(m => new { m.WorkspaceId, m.UserId });

            builder.Property(m => m.Role)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
        }
    }
}