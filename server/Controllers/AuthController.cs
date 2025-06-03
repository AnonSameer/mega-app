// server/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using server.Services;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ISessionService _sessionService; // Add this

        public AuthController(IUserService userService, ISessionService sessionService)
        {
            _userService = userService;
            _sessionService = sessionService; // Add this
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.AuthenticateByPinAsync(request.Pin);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid PIN" });
            }

            // ✅ CREATE SESSION HERE
            var sessionId = _sessionService.CreateSession(user.Id);

            // ✅ SET SESSION COOKIE
            Response.Cookies.Append("session", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // Set to true in production
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddHours(24)
            });

            return Ok(new
            {
                userId = user.Id,
                displayName = user.DisplayName,
                message = "Login successful"
            });
        }

        [HttpPost("logout")] // Add logout endpoint
        public ActionResult Logout()
        {
            var sessionId = Request.Cookies["session"];
            if (!string.IsNullOrEmpty(sessionId))
            {
                _sessionService.RemoveSession(sessionId);
            }

            Response.Cookies.Delete("session");
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")] // Add current user endpoint
        public ActionResult GetCurrentUser()
        {
            var sessionId = Request.Cookies["session"];
            if (string.IsNullOrEmpty(sessionId))
            {
                return Unauthorized(new { message = "No session" });
            }

            var userId = _sessionService.GetUserIdFromSession(sessionId);
            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid session" });
            }

            return Ok(new { userId = userId });
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!await _userService.IsPinAvailableAsync(request.Pin))
            {
                return BadRequest(new { message = "PIN already taken" });
            }
            var user = await _userService.CreateUserAsync(request.Pin, request.DisplayName);
            return Ok(new
            {
                userId = user.Id,
                displayName = user.DisplayName,
                message = "User created successfully"
            });
        }

        [HttpGet("check-pin/{pin}")]
        public async Task<ActionResult> CheckPinAvailability(string pin)
        {
            var isAvailable = await _userService.IsPinAvailableAsync(pin);
            return Ok(new { available = isAvailable });
        }
    }

    public class LoginRequest
    {
        public string Pin { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Pin { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
    }
}