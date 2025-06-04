using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using server.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        string dbPasswordPath = File.Exists("/run/secrets/db_password")
            ? "/run/secrets/db_password"
            : "/opt/mega-app/secrets/db_password";  // fallback for manual deploys / GitHub Actions

        if (!File.Exists(dbPasswordPath))
            throw new FileNotFoundException("Could not find db_password at /run/secrets/db_password or fallback.");

        var dbPassword = File.ReadAllText(dbPasswordPath).Trim();
        var connectionString = $"Host=localhost;Database=mega_organizer;Username=mega_user;Password={dbPassword};SSL Mode=Disable";

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
