// server/Program.cs
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services;
using Microsoft.EntityFrameworkCore.Sqlite;

var builder = WebApplication.CreateBuilder(args);

// Configure secrets and database connection
string connectionString;

if (builder.Environment.IsProduction())
{
    // Read secrets from Docker secrets
    // Try Docker secrets first, fall back to host secrets
    string dbPasswordPath = File.Exists("/run/secrets/db_password")
        ? "/run/secrets/db_password"
        : "/opt/mega-app/secrets/db_password";

    string apiKeyPath = File.Exists("/run/secrets/api_key")
        ? "/run/secrets/api_key"
        : "/opt/mega-app/secrets/api_key";

    var dbPassword = File.ReadAllText(dbPasswordPath).Trim();
    var apiKey = File.ReadAllText(apiKeyPath).Trim();

    // Build connection string with the actual password
    connectionString = $"Host=localhost;Database=mega_organizer;Username=mega_user;Password={dbPassword};SSL Mode=Disable";

    // Add API key to configuration
    builder.Configuration["ApiKey"] = apiKey;
    // Add Entity Framework with the connection string
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // Development - use appsettings
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
    if (builder.Environment.IsDevelopment() && connectionString.Contains(".sqlite"))
    {
        // Use SQLite for local development
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(connectionString));
    }
}



// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register your custom service
builder.Services.AddScoped<IMegaLinkService, MegaLinkService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ISessionService, SessionService>();
// Add this line with your other service registrations
builder.Services.AddScoped<IMegaAnalysisService, MegaAnalysisService>();
builder.Services.AddHttpClient<MegaAnalysisService>();


// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Allow all for local development
            policy.WithOrigins("http://localhost:3000") 
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();            
        }
        else
        {
            // Restrict for production
            policy.WithOrigins("https://TODO.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

// Run migrations automatically
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        if (app.Environment.IsProduction())
        {
            context.Database.Migrate(); // Use migrations in production
        }
        else
        {
            context.Database.EnsureCreated(); // Quick setup for development
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
        // Continue without crashing - we'll handle DB issues gracefully
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
    //app.UseMiddleware<SimpleAuthMiddleware>(); TEMP DISABLE
    app.UseHttpsRedirection();
}


app.UseCors("ReactApp");
app.MapControllers();

app.Run();