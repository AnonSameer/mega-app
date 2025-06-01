// server/Middleware/SimpleAuthMiddleware.cs
namespace server.Middleware
{
    public class SimpleAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public SimpleAuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip auth for Swagger in development
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                await _next(context);
                return;
            }

            // Check for API key
            var apiKey = context.Request.Headers["X-API-Key"].FirstOrDefault();
            var validApiKey = _configuration["ApiKey"];

            if (string.IsNullOrEmpty(apiKey) || apiKey != validApiKey)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            await _next(context);
        }
    }
}