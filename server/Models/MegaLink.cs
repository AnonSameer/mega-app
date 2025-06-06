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

        // === NEW MEGA ANALYSIS PROPERTIES ===

        /// <summary>
        /// Total number of files in the MEGA folder
        /// </summary>
        public int? FileCount { get; set; }

        /// <summary>
        /// Number of video files detected
        /// </summary>
        public int? VideoCount { get; set; }

        /// <summary>
        /// Number of image files detected
        /// </summary>
        public int? ImageCount { get; set; }

        /// <summary>
        /// Total size in bytes
        /// </summary>
        public long? TotalSizeBytes { get; set; }

        /// <summary>
        /// Human-readable size string (e.g., "1.5 GB")
        /// </summary>
        [MaxLength(50)]
        public string? FormattedSize { get; set; }

        /// <summary>
        /// Whether the link is currently accessible/active
        /// </summary>
        public bool IsActive { get; set; } = false;

        /// <summary>
        /// Last time the MEGA link was analyzed/refreshed
        /// </summary>
        public DateTime? LastAnalyzedAt { get; set; }

        /// <summary>
        /// Error message if analysis failed
        /// </summary>
        [MaxLength(500)]
        public string? AnalysisError { get; set; }

        /// <summary>
        /// Type of MEGA link (file, folder, unknown)
        /// </summary>
        [MaxLength(20)]
        public string? LinkType { get; set; }

        /// <summary>
        /// MEGA folder/file name extracted from analysis
        /// </summary>
        [MaxLength(200)]
        public string? MegaName { get; set; }
    }
}