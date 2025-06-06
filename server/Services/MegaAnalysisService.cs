using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace server.Services
{
    public interface IMegaAnalysisService
    {
        Task<MegaLinkInfo> AnalyzeMegaUrlAsync(string megaUrl);
        Task AnalyzeMegaLinkAsync(int linkId);
        Task<bool> IsMegaUrlAsync(string url);
    }

    public class MegaAnalysisService : IMegaAnalysisService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;

        public MegaAnalysisService(ApplicationDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<bool> IsMegaUrlAsync(string url)
        {
            return url.Contains("mega.nz") || url.Contains("mega.co.nz");
        }

        public async Task<MegaLinkInfo> AnalyzeMegaUrlAsync(string megaUrl)
        {
            if (!await IsMegaUrlAsync(megaUrl))
            {
                throw new ArgumentException("Not a valid MEGA URL");
            }

            try
            {
                var urlParts = ParseFolderUrl(megaUrl);
                var nodes = await GetNodesInSharedFolderAsync(urlParts.RootFolder);

                var linkInfo = new MegaLinkInfo
                {
                    Name = $"MEGA Folder ({urlParts.RootFolder[..Math.Min(8, urlParts.RootFolder.Length)]}...)",
                    Type = "folder",
                    FileCount = 0,
                    VideoCount = 0,
                    ImageCount = 0,
                    Size = 0
                };

                // Process all file nodes
                var fileNodes = nodes.Where(n => n.T == 0).ToList();

                foreach (var node in fileNodes)
                {
                    linkInfo.FileCount++;
                    linkInfo.Size += node.S ?? 0;

                    var classification = ClassifyFileBySize(node);
                    if (classification.IsVideo)
                    {
                        linkInfo.VideoCount++;
                    }
                    else if (classification.IsImage)
                    {
                        linkInfo.ImageCount++;
                    }
                }

                linkInfo.FormattedSize = FormatFileSize(linkInfo.Size);
                return linkInfo;
            }
            catch (Exception)
            {
                // Try as single file
                try
                {
                    var fileUrlParts = ParseFileUrl(megaUrl);
                    return new MegaLinkInfo
                    {
                        Name = $"MEGA File ({fileUrlParts.FileId[..Math.Min(8, fileUrlParts.FileId.Length)]}...)",
                        Type = "file",
                        FileCount = 1,
                        VideoCount = 0,
                        ImageCount = 0,
                        Size = 0,
                        FormattedSize = "Unknown size"
                    };
                }
                catch
                {
                    throw new ArgumentException("Invalid MEGA URL format");
                }
            }
        }

        public async Task AnalyzeMegaLinkAsync(int linkId)
        {
            var megaLink = await _context.MegaLinks.FindAsync(linkId);
            if (megaLink == null)
            {
                throw new ArgumentException($"MegaLink with ID {linkId} not found");
            }

            try
            {
                var analysisResult = await AnalyzeMegaUrlAsync(megaLink.Url);

                // Update the database record
                megaLink.FileCount = analysisResult.FileCount;
                megaLink.VideoCount = analysisResult.VideoCount;
                megaLink.ImageCount = analysisResult.ImageCount;
                megaLink.TotalSizeBytes = analysisResult.Size;
                megaLink.FormattedSize = analysisResult.FormattedSize;
                megaLink.IsActive = true; // If analysis succeeded, link is active
                megaLink.LinkType = analysisResult.Type;
                megaLink.MegaName = analysisResult.Name;
                megaLink.LastAnalyzedAt = DateTime.UtcNow;
                megaLink.AnalysisError = null; // Clear any previous errors
                megaLink.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Update with error info
                megaLink.IsActive = false;
                megaLink.AnalysisError = ex.Message;
                megaLink.LastAnalyzedAt = DateTime.UtcNow;
                megaLink.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                throw; // Re-throw so caller knows it failed
            }
        }

        private MegaUrlParts ParseFolderUrl(string url)
        {
            var patterns = new[]
            {
                @"mega\.nz/folder/([0-9a-zA-Z\-_]+)#([0-9a-zA-Z\-_]+)",
                @"mega\.nz/#F!([0-9a-zA-Z\-_]+)!([0-9a-zA-Z\-_]+)",
                @"mega\.co\.nz/folder/([0-9a-zA-Z\-_]+)#([0-9a-zA-Z\-_]+)",
                @"mega\.co\.nz/#F!([0-9a-zA-Z\-_]+)!([0-9a-zA-Z\-_]+)"
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(url, pattern);
                if (match.Success)
                {
                    return new MegaUrlParts
                    {
                        RootFolder = match.Groups[1].Value,
                        Key = match.Groups[2].Value
                    };
                }
            }

            throw new ArgumentException("No valid MEGA folder pattern found in URL");
        }

        private MegaFileUrlParts ParseFileUrl(string url)
        {
            var patterns = new[]
            {
                @"mega\.nz/file/([0-9a-zA-Z\-_]+)#([0-9a-zA-Z\-_]+)",
                @"mega\.nz/#!([0-9a-zA-Z\-_]+)!([0-9a-zA-Z\-_]+)",
                @"mega\.co\.nz/file/([0-9a-zA-Z\-_]+)#([0-9a-zA-Z\-_]+)",
                @"mega\.co\.nz/#!([0-9a-zA-Z\-_]+)!([0-9a-zA-Z\-_]+)"
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(url, pattern);
                if (match.Success)
                {
                    return new MegaFileUrlParts
                    {
                        FileId = match.Groups[1].Value,
                        Key = match.Groups[2].Value
                    };
                }
            }

            throw new ArgumentException("No valid MEGA file pattern found in URL");
        }

        private async Task<List<MegaNode>> GetNodesInSharedFolderAsync(string rootFolder)
        {
            var requestData = new object[] { new { a = "f", c = 1, ca = 1, r = 1 } };
            var url = $"https://g.api.mega.co.nz/cs?id=0&n={rootFolder}";

            var response = await _httpClient.PostAsync(url,
                new StringContent(JsonSerializer.Serialize(requestData), System.Text.Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"MEGA API error: {response.StatusCode} {response.ReasonPhrase}");
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            var apiResponse = JsonSerializer.Deserialize<MegaApiResponse[]>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (apiResponse == null || apiResponse.Length == 0 || apiResponse[0].F == null)
            {
                throw new Exception("Invalid response from MEGA API");
            }

            return apiResponse[0].F;
        }

        private FileClassification ClassifyFileBySize(MegaNode node)
        {
            var size = node.S ?? 0;

            // Video classification
            if (size > 500 * 1024 * 1024) return new FileClassification { IsVideo = true, Confidence = 0.95 };
            if (size > 100 * 1024 * 1024) return new FileClassification { IsVideo = true, Confidence = 0.85 };
            if (size > 50 * 1024 * 1024) return new FileClassification { IsVideo = true, Confidence = 0.75 };
            if (size > 20 * 1024 * 1024) return new FileClassification { IsVideo = true, Confidence = 0.60 };
            if (size > 10 * 1024 * 1024) return new FileClassification { IsVideo = true, Confidence = 0.45 };

            // Image classification
            if (size >= 100 * 1024 && size <= 10 * 1024 * 1024)
            {
                if (size > 5 * 1024 * 1024) return new FileClassification { IsImage = true, Confidence = 0.70 };
                if (size > 1 * 1024 * 1024) return new FileClassification { IsImage = true, Confidence = 0.80 };
                if (size > 500 * 1024) return new FileClassification { IsImage = true, Confidence = 0.75 };
                return new FileClassification { IsImage = true, Confidence = 0.65 };
            }

            return new FileClassification { IsVideo = false, IsImage = false, Confidence = 0.90 };
        }

        private string FormatFileSize(long bytes)
        {
            if (bytes == 0) return "0 Bytes";

            var sizes = new[] { "Bytes", "KB", "MB", "GB", "TB" };
            var i = Math.Floor(Math.Log(bytes) / Math.Log(1024));
            var size = bytes / Math.Pow(1024, i);

            return $"{size:F2} {sizes[(int)i]}";
        }
    }

    // Supporting classes
    public class MegaLinkInfo
    {
        public string Name { get; set; } = string.Empty;
        public long Size { get; set; }
        public string Type { get; set; } = "unknown";
        public int FileCount { get; set; }
        public int VideoCount { get; set; }
        public int ImageCount { get; set; }
        public string FormattedSize { get; set; } = "0 Bytes";
    }

    public class MegaUrlParts
    {
        public string RootFolder { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
    }

    public class MegaFileUrlParts
    {
        public string FileId { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
    }

    public class MegaNode
    {
        public string H { get; set; } = string.Empty;
        public int T { get; set; }
        public long? S { get; set; }
        public string A { get; set; } = string.Empty;
        public string K { get; set; } = string.Empty;
        public string? P { get; set; }
    }

    public class MegaApiResponse
    {
        public List<MegaNode> F { get; set; } = new();
    }

    public class FileClassification
    {
        public bool IsVideo { get; set; }
        public bool IsImage { get; set; }
        public double Confidence { get; set; }
    }
}