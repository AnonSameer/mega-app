using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using server.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{env}.json", optional: true)
            .AddEnvironmentVariables();

        var configuration = builder.Build();

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        if (env == "Production")
        {
            string dbPasswordPath = File.Exists("/run/secrets/db_password")
                ? "/run/secrets/db_password"
                : "/opt/mega-app/secrets/db_password";

            if (!File.Exists(dbPasswordPath))
                throw new FileNotFoundException("Expected Docker secret at /run/secrets/db_password or fallback");

            var dbPassword = File.ReadAllText(dbPasswordPath).Trim();
            var connectionString = $"Host=localhost;Database=mega_organizer;Username=mega_user;Password={dbPassword};SSL Mode=Disable";
            optionsBuilder.UseNpgsql(connectionString);
        }
        else
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (connectionString.Contains(".sqlite"))
            {
                optionsBuilder.UseSqlite(connectionString);
            }
            else
            {
                optionsBuilder.UseNpgsql(connectionString);
            }
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
