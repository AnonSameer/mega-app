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

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.AuthenticateByPinAsync(request.Pin);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid PIN" });
            }

            return Ok(new
            {
                userId = user.Id,
                displayName = user.DisplayName,
                message = "Login successful"
            });
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