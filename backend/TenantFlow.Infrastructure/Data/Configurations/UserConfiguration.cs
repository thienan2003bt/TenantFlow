using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TenantFlow.Infrastructure.Services.Identity;

namespace TenantFlow.Infrastructure.Data.Configurations;

public class UserConfiguration: IEntityTypeConfiguration<ApplicationUser>
{
  public void Configure(EntityTypeBuilder<ApplicationUser> builder)
  {
    // Identity configures its own built-in columns automatically.
    
    builder.Property(u => u.Status).IsRequired();
    builder.Property(u => u.CreatedAt).IsRequired();
    builder.Property(u => u.UpdatedAt).IsRequired();
  }
}