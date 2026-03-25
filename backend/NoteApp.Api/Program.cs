using Hangfire;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NoteApp.Api.Configuration;
using NoteApp.Api.Data;
using NoteApp.Api.Entities;
using NoteApp.Api.Entities.DTOs;
using NoteApp.Api.Helpers;
using NoteApp.Api.Interfaces.IRepositories;
using NoteApp.Api.Interfaces.IService;
using NoteApp.Api.Jobs;
using NoteApp.Api.Middlewares;
using NoteApp.Api.Repositories;
using NoteApp.Api.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


//logger(serilog) configuration
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt",
        rollingInterval: RollingInterval.Day,
        fileSizeLimitBytes: 20_000_000,
        rollOnFileSizeLimit: true,
        retainedFileCountLimit:20)
    .CreateLogger();

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
            new BadRequestObjectResult(new ResponseViewModel
            {
                Success = false,
                Message = "Invalid input",
                Error = new ErrorViewModel
                {
                    Code = "INPUT_VALIDATION_ERROR",
                    Errors = ModelStateHelper.GetErrors(context.ModelState)
                }
            });
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();
builder.Services.AddSerilog();

//DbContext
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

//Configuration
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtBearer"));

//hangfire configuration
builder.Services.AddHangfire(config =>
{
    config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("HangFireConnection"));
});

builder.Services.AddHangfireServer();

//Services and Repositories
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<IFolderService, FolderService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

//Cors
builder.Services.AddCors((options) =>
{
    options.AddPolicy("DevCors", (corsBuilder) =>
    {
        corsBuilder.WithOrigins("http://localhost:4200", "http://localhost:3000", "http://localhost:8000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
    options.AddPolicy("ProdCors", (corsBuilder) =>
    {
        corsBuilder.WithOrigins("https://myProductionSite.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

//Identity & Authentication & Authorization
builder.Services.AddAuthorization();
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
var jwtOptions = builder.Configuration.GetSection("JwtBearer").Get<JwtOptions>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
        };

        options.Events = new JwtBearerEvents
        {
            //read token from cookie or header
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["accessToken"];
                if (string.IsNullOrWhiteSpace(token))
                {
                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    if (authHeader.StartsWith("Bearer "))
                    {
                        token = authHeader.Substring("Bearer ".Length);
                    }
                }
                context.Token = token;
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

app.UseMiddleware<ExceptionHandlerMiddleware>();
//app.UseStatusCodePages();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevCors");
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseCors("ProdCors");
    app.UseHttpsRedirection();
}

app.UseHangfireDashboard();

//jobs
RecurringJob.AddOrUpdate<RefreshTokenCleaning>("cleanup-refreshTokens", job => job.Execute(), Cron.Daily());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
