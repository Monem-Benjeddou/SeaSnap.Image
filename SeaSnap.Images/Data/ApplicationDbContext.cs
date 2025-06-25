using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using SeaSnap.Images.Models;
using Microsoft.EntityFrameworkCore;
using SeaSnap.Images.Services.Interfaces;

namespace SeaSnap.Images.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantService tenantService)
    : IdentityDbContext<
        User,
        IdentityRole<Guid>,
        Guid,
        IdentityUserClaim<Guid>,
        IdentityUserRole<Guid>,
        IdentityUserLogin<Guid>,
        IdentityRoleClaim<Guid>,
        IdentityUserToken<Guid>>(options)
{
    public DbSet<ImageMetadata> Images { get; set; }
    public DbSet<Company> Companies { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ImageMetadata>().HasIndex(x => x.FileName).IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Company)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CompanyId)
            .IsRequired();

        modelBuilder.Entity<ImageMetadata>()
            .HasOne(i => i.Company)
            .WithMany(c => c.Images)
            .HasForeignKey(i => i.CompanyId)
            .IsRequired(); 

        var currentCompanyId = tenantService.GetCurrentCompanyId();

        if (currentCompanyId.HasValue)
        {
            modelBuilder.Entity<ImageMetadata>().HasQueryFilter(i => i.CompanyId == currentCompanyId.Value);

            modelBuilder.Entity<User>().HasQueryFilter(u => u.CompanyId == currentCompanyId.Value);
        }

        SeedRoles(modelBuilder);
        SeedCompanies(modelBuilder);
        SeedAdminUser(modelBuilder); 
    }

    private void SeedRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<IdentityRole<Guid>>().HasData(
            new IdentityRole<Guid>
            {
                Id = new Guid("eca8c205-4b90-4dfa-8f2b-15168ec1a97e"),
                Name = "CompanyAdmin",
                NormalizedName = "COMPANYADMIN",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            },
            new IdentityRole<Guid>
            {
                Id = new Guid("0ddafe30-6b46-4323-9ca7-a460e7e48ba1"),
                Name = "Editor",
                NormalizedName = "EDITOR",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            },
            new IdentityRole<Guid>
            {
                Id = new Guid("173796c6-5e1c-4155-8811-c9beaa162d71"),
                Name = "Viewer",
                NormalizedName = "VIEWER",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            }
        );
    }

    private void SeedCompanies(ModelBuilder modelBuilder)
    {
        var company1Id = Guid.Parse("c2f3072c-5e32-49e4-a24b-64359a804274");
        var company2Id = Guid.Parse("d3e4183d-6f43-50f5-b35c-75460b915385");

        modelBuilder.Entity<Company>().HasData(
            new Company { Id = company1Id, Name = "Acme Corporation", CreatedAt = DateTime.UtcNow },
            new Company { Id = company2Id, Name = "Globex Inc.", CreatedAt = DateTime.UtcNow }
        );
    }

    private void SeedAdminUser(ModelBuilder modelBuilder)
    {
        var company1Id = Guid.Parse("c2f3072c-5e32-49e4-a24b-64359a804274");
        var initialCompanyAdminUserId = Guid.Parse("b2f3072c-5e32-49e4-a24b-64359a804274");
        var companyAdminRoleId = Guid.Parse("eca8c205-4b90-4dfa-8f2b-15168ec1a97e");

        var admin = new User
        {
            Id = initialCompanyAdminUserId,
            UserName = "acmecorpadmin",
            NormalizedUserName = "ACMCORPADMIN",
            Email = "admin@acmecorp.com",
            NormalizedEmail = "ADMIN@ACMCORP.COM",
            EmailConfirmed = true,
            FullName = "Acme Corp Admin",
            SecurityStamp = Guid.NewGuid().ToString(),
            CompanyId = company1Id 
        };

        var hasher = new PasswordHasher<User>();
        admin.PasswordHash = hasher.HashPassword(admin, "Admin@123!zh5");

        modelBuilder.Entity<User>().HasData(admin);

        modelBuilder.Entity<IdentityUserRole<Guid>>().HasData(new IdentityUserRole<Guid>
        {
            UserId = initialCompanyAdminUserId,
            RoleId = companyAdminRoleId
        });
    }
}