//// Controllers/MegaLinksController.cs
//using Microsoft.AspNetCore.Mvc;
//using server.Models;
//using server.Services;

//namespace server.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class MegaLinksController : ControllerBase
//    {
//        private readonly IMegaLinkService _megaLinkService;

//        // Dependency injection - the service gets "injected" here
//        public MegaLinksController(IMegaLinkService megaLinkService)
//        {
//            _megaLinkService = megaLinkService;
//        }

//        // GET: api/megalinks
//        [HttpGet]
//        public async Task<ActionResult<List<MegaLink>>> GetAllLinks()
//        {
//            var links = await _megaLinkService.GetAllLinksAsync();
//            return Ok(links);
//        }

//        // GET: api/megalinks/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<MegaLink>> GetLink(int id)
//        {
//            var link = await _megaLinkService.GetLinkByIdAsync(id);
//            if (link == null)
//            {
//                return NotFound();
//            }
//            return Ok(link);
//        }

//        // POST: api/megalinks
//        [HttpPost]
//        public async Task<ActionResult<MegaLink>> CreateLink(MegaLink link)
//        {
//            var createdLink = await _megaLinkService.CreateLinkAsync(link);
//            return CreatedAtAction(nameof(GetLink), new { id = createdLink.Id }, createdLink);
//        }

//        // PUT: api/megalinks/5
//        [HttpPut("{id}")]
//        public async Task<IActionResult> UpdateLink(int id, MegaLink link)
//        {
//            var updatedLink = await _megaLinkService.UpdateLinkAsync(id, link);
//            if (updatedLink == null)
//            {
//                return NotFound();
//            }
//            return Ok(updatedLink);
//        }

//        // DELETE: api/megalinks/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteLink(int id)
//        {
//            var result = await _megaLinkService.DeleteLinkAsync(id);
//            if (!result)
//            {
//                return NotFound();
//            }
//            return NoContent();
//        }

//        // GET: api/megalinks/bytag/work
//        [HttpGet("bytag/{tag}")]
//        public async Task<ActionResult<List<MegaLink>>> GetLinksByTag(string tag)
//        {
//            var links = await _megaLinkService.GetLinksByTagAsync(tag);
//            return Ok(links);
//        }
//    }
//}