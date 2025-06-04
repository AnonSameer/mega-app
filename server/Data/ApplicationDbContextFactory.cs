// server/Data/ApplicationDbContextFactory.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using server.Data;

namespace server.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            string dbPasswordPath = "/run/secrets/db_password";
            if (!File.Exists(dbPasswordPath))
            {
                throw new FileNotFoundException("Expected Docker secret at /run/secrets/db_password");
            }

            var dbPassword = File.ReadAllText(dbPasswordPath).Trim();
            var connectionString = $"Host=localhost;Database=mega_organizer;Username=mega_user;Password={dbPassword};SSL Mode=Disable";

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
