using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Services
{
    public interface IUserService
    {
        Task<User?> AuthenticateByPinAsync(string pin);
        Task<User> CreateUserAsync(string pin, string? displayName = null);
        Task<bool> IsPinAvailableAsync(string pin);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> AuthenticateByPinAsync(string pin)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Pin == pin);

            if (user != null)
            {
                // Update last access time
                user.LastAccessAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return user;
        }

        public async Task<User> CreateUserAsync(string pin, string? displayName = null)
        {
            var user = new User
            {
                Pin = pin,
                DisplayName = displayName ?? $"User {pin}",
                CreatedAt = DateTime.UtcNow,
                LastAccessAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> IsPinAvailableAsync(string pin)
        {
            return !await _context.Users.AnyAsync(u => u.Pin == pin);
        }
    }
}