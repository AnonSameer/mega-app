// server/Program.cs
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services;
using server.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configure secrets in production
if (builder.Environment.IsProduction())
{
    // Read secrets from Docker secrets
    var dbPassword = File.ReadAllText("/run/secrets/db_password").Trim();
    var apiKey = File.ReadAllText("/run/secrets/api_key").Trim();

    // Build connection string with secret
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?.Replace("{DB_PASSWORD}", dbPassword);

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));

    // Add API key to configuration
    builder.Configuration["ApiKey"] = apiKey;
}
else
{
    // Development - use appsettings
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register your custom service
builder.Services.AddScoped<IMegaLinkService, MegaLinkService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        var allowedOrigins = builder.Environment.IsProduction()
            ? new[] { "https://yourdomain.com" }
            : new[] { "http://localhost:3000" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Run migrations automatically
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (app.Environment.IsProduction())
    {
        context.Database.Migrate(); // Use migrations in production
    }
    else
    {
        context.Database.EnsureCreated(); // Quick setup for development
    }
}

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseMiddleware<SimpleAuthMiddleware>();
}

app.UseHttpsRedirection();
app.UseCors("ReactApp");
app.MapControllers();

app.Run();