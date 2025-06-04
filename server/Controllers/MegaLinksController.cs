// server/Controllers/MegaLinksController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Services;

[ApiController]
[Route("api/[controller]")]
public class MegaLinksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ISessionService _sessionService;

    public MegaLinksController(ApplicationDbContext context, ISessionService sessionService)
    {
        _context = context;
        _sessionService = sessionService;
    }

    [HttpPost]
    public async Task<ActionResult<MegaLink>> CreateMegaLink(CreateMegaLinkRequest request)
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized(new { message = "Please log in first" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var megaLink = new MegaLink
        {
            Title = request.Title,
            Url = request.Url,
            Description = request.Description ?? string.Empty,
            Tags = request.Tags ?? new List<string>(),
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.MegaLinks.Add(megaLink);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMegaLink), new { id = megaLink.Id }, megaLink);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MegaLink>>> GetMegaLinks()
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized(new { message = "Please log in first" });
        }

        var links = await _context.MegaLinks
            .Where(ml => ml.UserId == userId.Value)
            .OrderByDescending(ml => ml.CreatedAt)
            .ToListAsync();

        return Ok(links);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MegaLink>> GetMegaLink(int id)
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized();
        }

        var megaLink = await _context.MegaLinks
            .Where(ml => ml.Id == id && ml.UserId == userId.Value)
            .FirstOrDefaultAsync();

        if (megaLink == null)
        {
            return NotFound();
        }

        return megaLink;
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MegaLink>> UpdateMegaLink(int id, CreateMegaLinkRequest request)
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized();
        }

        var megaLink = await _context.MegaLinks
            .Where(ml => ml.Id == id && ml.UserId == userId.Value)
            .FirstOrDefaultAsync();

        if (megaLink == null)
        {
            return NotFound();
        }

        megaLink.Title = request.Title;
        megaLink.Url = request.Url;
        megaLink.Description = request.Description ?? string.Empty;
        megaLink.Tags = request.Tags ?? new List<string>();
        megaLink.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return megaLink;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMegaLink(int id)
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized();
        }

        var megaLink = await _context.MegaLinks
            .Where(ml => ml.Id == id && ml.UserId == userId.Value)
            .FirstOrDefaultAsync();

        if (megaLink == null)
        {
            return NotFound();
        }

        _context.MegaLinks.Remove(megaLink);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}