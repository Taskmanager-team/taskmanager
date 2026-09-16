using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Common;

namespace TaskManager.Infrastructure.Persistence.Configuration
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Email)
                .HasColumnName("Email")
                .HasMaxLength(320)
                .IsRequired();

            builder.HasIndex(u => u.Email).IsUnique();
        }
    }
}