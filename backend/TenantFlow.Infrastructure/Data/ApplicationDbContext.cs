using Microsoft.EntityFrameworkCore;
using TenantFlow.Core.Entities;

namespace TenantFlow.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // DbSets represent database tables
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<UserIdentity> UserIdentities { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    public DbSet<AuthFactor> AuthFactors { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<UserToken> UserTokens { get; set; }
    public DbSet<UserRoleAssignment> UserRoleAssignments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        ConfigureAllEntities(modelBuilder);
    }

    private static void ConfigureAllEntities(ModelBuilder modelBuilder)
    {
        // This runs for all entities automatically via Fluent API
        // Individual entity configurations are in EntityConfigurations/ folder
    }
}