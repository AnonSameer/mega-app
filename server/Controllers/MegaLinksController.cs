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
    private readonly IMegaAnalysisService _megaAnalysisService;

    public MegaLinksController(
        ApplicationDbContext context,
        ISessionService sessionService,
        IMegaAnalysisService megaAnalysisService)
    {
        _context = context;
        _sessionService = sessionService;
        _megaAnalysisService = megaAnalysisService;
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

        // Check if it's a MEGA link and analyze immediately - SAME AS MANUAL REFRESH
        var isMegaUrl = await _megaAnalysisService.IsMegaUrlAsync(megaLink.Url);

        if (isMegaUrl)
        {
            try
            {
                Console.WriteLine($"Analyzing new MEGA link immediately: {megaLink.Id}");
                await _megaAnalysisService.AnalyzeMegaLinkAsync(megaLink.Id);
                Console.WriteLine($"Completed analysis for new MEGA link: {megaLink.Id}");

                // Reload the link with updated analysis data
                await _context.Entry(megaLink).ReloadAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Analysis failed for new MEGA link {megaLink.Id}: {ex.Message}");
                // Don't fail the creation, just log the error
                // The link is still created, just without analysis data
            }
        }

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

        var urlChanged = megaLink.Url != request.Url;

        megaLink.Title = request.Title;
        megaLink.Url = request.Url;
        megaLink.Description = request.Description ?? string.Empty;
        megaLink.Tags = request.Tags ?? new List<string>();
        megaLink.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // If URL changed, re-analyze the link
        if (urlChanged)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await _megaAnalysisService.AnalyzeMegaLinkAsync(megaLink.Id);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Background MEGA analysis failed for updated link {megaLink.Id}: {ex.Message}");
                }
            });
        }

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

    /// <summary>
    /// Refresh analysis for a specific MEGA link
    /// </summary>
    [HttpPost("{id}/refresh")]
    public async Task<ActionResult<MegaLink>> RefreshMegaLink(int id)
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

        try
        {
            await _megaAnalysisService.AnalyzeMegaLinkAsync(id);

            // Reload the updated link
            await _context.Entry(megaLink).ReloadAsync();

            return Ok(megaLink);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to refresh MEGA link: {ex.Message}" });
        }
    }

    /// <summary>
    /// Refresh analysis for all user's MEGA links - SYNCHRONOUS like manual refresh
    /// </summary>
    [HttpPost("refresh-all")]
    public async Task<ActionResult> RefreshAllMegaLinks()
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized();
        }

        var linkIds = await _context.MegaLinks
            .Where(ml => ml.UserId == userId.Value)
            .Select(ml => ml.Id)
            .ToListAsync();

        if (!linkIds.Any())
        {
            return Ok(new { message = "No links to refresh", linkCount = 0 });
        }

        int successCount = 0;
        int errorCount = 0;
        var errors = new List<string>();

        // Process each link synchronously - SAME AS MANUAL REFRESH
        foreach (var linkId in linkIds)
        {
            try
            {
                await _megaAnalysisService.AnalyzeMegaLinkAsync(linkId);
                successCount++;

                // Small delay to avoid overwhelming the MEGA API
                await Task.Delay(1000);
            }
            catch (Exception ex)
            {
                errorCount++;
                errors.Add($"Link {linkId}: {ex.Message}");
                Console.WriteLine($"MEGA analysis failed for link {linkId}: {ex.Message}");
            }
        }

        return Ok(new
        {
            message = $"Completed refresh for {linkIds.Count} links. Success: {successCount}, Errors: {errorCount}",
            linkCount = linkIds.Count,
            successCount = successCount,
            errorCount = errorCount,
            errors = errors.Take(3).ToArray() // Only return first 3 errors to avoid huge response
        });
    }

    /// <summary>
    /// Get analysis status for user's links
    /// </summary>
    [HttpGet("analysis-status")]
    public async Task<ActionResult> GetAnalysisStatus()
    {
        var userId = HttpContext.GetCurrentUserId(_sessionService);
        if (userId == null)
        {
            return Unauthorized();
        }

        var stats = await _context.MegaLinks
            .Where(ml => ml.UserId == userId.Value)
            .GroupBy(ml => 1)
            .Select(g => new
            {
                TotalLinks = g.Count(),
                AnalyzedLinks = g.Count(ml => ml.LastAnalyzedAt != null),
                ActiveLinks = g.Count(ml => ml.IsActive),
                TotalVideos = g.Sum(ml => ml.VideoCount ?? 0),
                TotalImages = g.Sum(ml => ml.ImageCount ?? 0),
                TotalFiles = g.Sum(ml => ml.FileCount ?? 0),
                TotalSizeBytes = g.Sum(ml => ml.TotalSizeBytes ?? 0)
            })
            .FirstOrDefaultAsync();

        return Ok(stats ?? new
        {
            TotalLinks = 0,
            AnalyzedLinks = 0,
            ActiveLinks = 0,
            TotalVideos = 0,
            TotalImages = 0,
            TotalFiles = 0,
            TotalSizeBytes = 0L
        });
    }
}