using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.DTOs;
using AutoMapper;
using TimesheetAPI.Repositories;
using TimesheetAPI.Models;

namespace TimesheetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : Controller
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet("active-employees")]
    public async Task<ActionResult<IEnumerable<GetEmployeeDto>>> GetActiveEmployee()
    {
        var activeEmployees = await _unitOfWork.Users.FindAsync(u => u.IsActive && u.Role == "Employee");
        var result = _mapper.Map<IEnumerable<GetEmployeeDto>>(activeEmployees);
        return Ok(result);
    }
}
