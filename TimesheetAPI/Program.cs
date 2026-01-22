using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TimesheetAPI.Data;
using TimesheetAPI.Repositories;
using TimesheetAPI.Services;
using TimesheetAPI.Patterns;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------
// Add services to the container
// ------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------------------------
// CORS
// ------------------------------------
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAngularApp", policy =>
		policy.WithOrigins("http://localhost:4200")
			  .AllowAnyMethod()
			  .AllowAnyHeader()
			  .AllowCredentials());
});

// ------------------------------------
// Database
// ------------------------------------
builder.Services.AddDbContext<TimesheetDbContext>(options =>
	options.UseSqlServer(
		"Server=localhost,1433;Database=Timesheet;User Id=sa;Password=Password;TrustServerCertificate=True",
		sqlOptions => sqlOptions.EnableRetryOnFailure()
	)
);

// ------------------------------------
// AutoMapper
// ------------------------------------
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ------------------------------------
// Repositories & Unit of Work
// ------------------------------------
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITimesheetRepository, TimesheetRepository>();
builder.Services.AddScoped<IProjectAssignmentRepository, ProjectAssignmentRepository>();

// ------------------------------------
// Services
// ------------------------------------
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectAssignmentService, ProjectAssignmentService>();
builder.Services.AddScoped<ITimesheetService, TimesheetService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<TokenService>(); // ✅ REQUIRED for JWT

// ------------------------------------
// Design Patterns
// ------------------------------------
builder.Services.AddScoped<IApprovalStrategy, ManagerApprovalStrategy>();
builder.Services.AddScoped<IReportFactory, ReportFactory>();

// ------------------------------------
// JWT Authentication
// ------------------------------------
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = "YourSuperSecureAndLongSecretKey123!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateLifetime = true,
			ValidateIssuerSigningKey = true,

			ValidIssuer = jwtSettings["Issuer"],
			ValidAudience = jwtSettings["Audience"],
			IssuerSigningKey = new SymmetricSecurityKey(
				Encoding.UTF8.GetBytes(jwtKey!)
			)
		};
	});

builder.Services.AddAuthorization();

// ------------------------------------
// Build App
// ------------------------------------
var app = builder.Build();

// ------------------------------------
// Middleware Pipeline
// ------------------------------------
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");

app.UseAuthentication(); // 🔐 MUST come before Authorization
app.UseAuthorization();

app.MapControllers();

app.Run();
