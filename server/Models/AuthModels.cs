// server/Models/AuthModels.cs
using System.ComponentModel.DataAnnotations;

public class LoginRequest
{
    [Required]
    public string Pin { get; set; } = string.Empty;
}

public class AuthSession
{
    public int UserId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}