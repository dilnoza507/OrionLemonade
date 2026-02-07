using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll(CancellationToken cancellationToken)
    {
        var employees = await _employeeService.GetAllAsync(cancellationToken);
        return Ok(employees);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetActive(CancellationToken cancellationToken)
    {
        var employees = await _employeeService.GetActiveAsync(cancellationToken);
        return Ok(employees);
    }

    [HttpGet("by-branch/{branchId}")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetByBranch(int branchId, CancellationToken cancellationToken)
    {
        var employees = await _employeeService.GetByBranchAsync(branchId, cancellationToken);
        return Ok(employees);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var employee = await _employeeService.GetByIdAsync(id, cancellationToken);
        if (employee is null) return NotFound();
        return Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeDto dto, CancellationToken cancellationToken)
    {
        var employee = await _employeeService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EmployeeDto>> Update(int id, UpdateEmployeeDto dto, CancellationToken cancellationToken)
    {
        var employee = await _employeeService.UpdateAsync(id, dto, cancellationToken);
        if (employee is null) return NotFound();
        return Ok(employee);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _employeeService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
