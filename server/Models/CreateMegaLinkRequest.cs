// server/Models/CreateMegaLinkRequest.cs
using System.ComponentModel.DataAnnotations;

public class CreateMegaLinkRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public List<string>? Tags { get; set; }
}