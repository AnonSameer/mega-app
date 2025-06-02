using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Text.Json;

namespace server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<MegaLink> MegaLinks { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Tags as JSON column
            modelBuilder.Entity<MegaLink>()
                .Property(e => e.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null) ?? new List<string>()
                );

            // Configure User-MegaLink relationship (One-to-Many)
            modelBuilder.Entity<MegaLink>()
                .HasOne(m => m.User)
                .WithMany(u => u.MegaLinks)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Delete user = delete all their links

            // Ensure PIN is unique (no two users can have same PIN)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Pin)
                .IsUnique();
        }
    }
}