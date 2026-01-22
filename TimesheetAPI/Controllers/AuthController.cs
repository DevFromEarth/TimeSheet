using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TimesheetAPI.DTOs;
using TimesheetAPI.Models;
using TimesheetAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace TimesheetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly TimesheetDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(TimesheetDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);
        if (user == null || user.Password != dto.Password)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var tokenHandler = new JwtSecurityTokenHandler();
		var key = Encoding.UTF8.GetBytes("YourSuperSecureAndLongSecretKey123!");
		var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        };

        return Ok(new LoginResponseDto { Token = tokenString, User = userDto });
    }
}
