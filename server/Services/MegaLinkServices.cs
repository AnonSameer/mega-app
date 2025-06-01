// server/Services/MegaLinkService.cs - Replace with EF version
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Services
{
    public interface IMegaLinkService
    {
        Task<List<MegaLink>> GetAllLinksAsync();
        Task<MegaLink?> GetLinkByIdAsync(int id);
        Task<MegaLink> CreateLinkAsync(MegaLink link);
        Task<MegaLink?> UpdateLinkAsync(int id, MegaLink link);
        Task<bool> DeleteLinkAsync(int id);
        Task<List<MegaLink>> GetLinksByTagAsync(string tag);
    }

    public class MegaLinkService : IMegaLinkService
    {
        private readonly ApplicationDbContext _context;

        public MegaLinkService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MegaLink>> GetAllLinksAsync()
        {
            return await _context.MegaLinks
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<MegaLink?> GetLinkByIdAsync(int id)
        {
            return await _context.MegaLinks.FindAsync(id);
        }

        public async Task<MegaLink> CreateLinkAsync(MegaLink link)
        {
            link.CreatedAt = DateTime.UtcNow;
            link.UpdatedAt = DateTime.UtcNow;

            _context.MegaLinks.Add(link);
            await _context.SaveChangesAsync();
            return link;
        }

        public async Task<MegaLink?> UpdateLinkAsync(int id, MegaLink updatedLink)
        {
            var existingLink = await _context.MegaLinks.FindAsync(id);
            if (existingLink == null) return null;

            existingLink.Title = updatedLink.Title;
            existingLink.Url = updatedLink.Url;
            existingLink.Description = updatedLink.Description;
            existingLink.Tags = updatedLink.Tags;
            existingLink.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingLink;
        }

        public async Task<bool> DeleteLinkAsync(int id)
        {
            var link = await _context.MegaLinks.FindAsync(id);
            if (link == null) return false;

            _context.MegaLinks.Remove(link);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MegaLink>> GetLinksByTagAsync(string tag)
        {
            return await _context.MegaLinks
                .Where(l => l.Tags.Contains(tag))
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }
    }
}