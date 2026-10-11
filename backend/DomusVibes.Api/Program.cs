using System.Text;
using DVC.Api.Middleware;
using DomusVibes.Api.Auth;
using DomusVibes.Api.Hubs;
using DomusVibes.Application.Notices;
using DomusVibes.Application.Users.Commands.CreateUser;
using DomusVibes.Persistence;
using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);

var renderPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(renderPort))
    builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ---------------------------------------------
// Add services
// ---------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("Set Jwt:Key to a secret of at least 32 characters.");

var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                    context.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtTokenService>();

// CORS - Allow frontend to communicate with backend
builder.Services.AddCors(options =>
{
    var origins = new List<string> { "http://localhost:4200" };
    var extraOrigins = builder.Configuration["Cors:Origins"];
    if (!string.IsNullOrWhiteSpace(extraOrigins))
    {
        origins.AddRange(extraOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }

    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(origins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


// MediatR - registers all handlers in the CreateUserCommand assembly
builder.Services.AddMediatR(typeof(CreateUserCommand).Assembly);
builder.Services.AddScoped<HomeNoticeWriter>();

// FluentValidation - we register validators from the assembly
// builder.Services.AddScoped<IValidator<CreateUserCommand>, CreateUserValidator>();

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
builder.Services.AddFluentValidationAutoValidation();


// ---------------------------------------------
// Build app
// ---------------------------------------------
var app = builder.Build();


string[] summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

// ---------------------------------------------
// Enable Swagger only in Development
// ---------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseGlobalErrorHandler();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Welcome to DomusVibes API");

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
    .ToArray();

    return forecast;
})
.WithName("GetWeatherForecast");


app.MapControllers();
app.MapHub<HomeHub>("/hubs/home");

app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
