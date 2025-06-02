using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 4)]
        public string Pin { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? DisplayName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastAccessAt { get; set; } = DateTime.UtcNow;

        // Navigation property - one user has many links
        public virtual ICollection<MegaLink> MegaLinks { get; set; } = new List<MegaLink>();
    }
}