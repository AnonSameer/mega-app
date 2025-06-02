using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class MegaLink
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Url { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        public List<string> Tags { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key to User
        public int UserId { get; set; }

        // Navigation property - this link belongs to one user
        public virtual User User { get; set; } = null!;
    }
}