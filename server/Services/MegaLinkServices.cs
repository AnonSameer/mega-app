// Services/MegaLinkService.cs
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
        // For now, we'll use in-memory storage
        // Later you'll replace this with a database
        private static List<MegaLink> _links = new List<MegaLink>();
        private static int _nextId = 1;

        public Task<List<MegaLink>> GetAllLinksAsync()
        {
            return Task.FromResult(_links);
        }

        public Task<MegaLink?> GetLinkByIdAsync(int id)
        {
            var link = _links.FirstOrDefault(l => l.Id == id);
            return Task.FromResult(link);
        }

        public Task<MegaLink> CreateLinkAsync(MegaLink link)
        {
            link.Id = _nextId++;
            link.CreatedAt = DateTime.UtcNow;
            link.UpdatedAt = DateTime.UtcNow;
            _links.Add(link);
            return Task.FromResult(link);
        }

        public Task<MegaLink?> UpdateLinkAsync(int id, MegaLink updatedLink)
        {
            var existingLink = _links.FirstOrDefault(l => l.Id == id);
            if (existingLink == null) return Task.FromResult<MegaLink?>(null);

            existingLink.Title = updatedLink.Title;
            existingLink.Url = updatedLink.Url;
            existingLink.Description = updatedLink.Description;
            existingLink.Tags = updatedLink.Tags;
            existingLink.UpdatedAt = DateTime.UtcNow;

            return Task.FromResult<MegaLink?>(existingLink);
        }

        public Task<bool> DeleteLinkAsync(int id)
        {
            var link = _links.FirstOrDefault(l => l.Id == id);
            if (link == null) return Task.FromResult(false);

            _links.Remove(link);
            return Task.FromResult(true);
        }

        public Task<List<MegaLink>> GetLinksByTagAsync(string tag)
        {
            var filteredLinks = _links.Where(l => l.Tags.Contains(tag, StringComparer.OrdinalIgnoreCase)).ToList();
            return Task.FromResult(filteredLinks);
        }
    }
}