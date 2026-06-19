using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TenantFlow.Core.Entities;

namespace TenantFlow.Infrastructure.Data.EntityConfigurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
  public void Configure(EntityTypeBuilder<User> builder)
  {
    builder.HasKey(u => u.Id);
    builder.Property(u => u.Username).IsRequired().HasMaxLength(100);
    builder.Property(u => u.Email).IsRequired().HasMaxLength(255);
    builder.Property(u => u.PasswordHash).IsRequired();
    builder.Property(u => u.TenantId).IsRequired();

    // Relationships
    builder.HasMany(u => u.UserIdentities)
           .WithOne(ui => ui.User)
           .HasForeignKey(ui => ui.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasMany(u => u.UserSessions)
           .WithOne(us => us.User)
           .HasForeignKey(us => us.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasMany(u => u.UserTokens)
           .WithOne(ut => ut.User)
           .HasForeignKey(ut => ut.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasMany(u => u.UserRoleAssignments)
           .WithOne(ura => ura.User)
           .HasForeignKey(ura => ura.UserId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}