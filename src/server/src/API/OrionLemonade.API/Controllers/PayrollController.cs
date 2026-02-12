using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;
using System.Security.Claims;

namespace OrionLemonade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _payrollService;

    public PayrollController(IPayrollService payrollService)
    {
        _payrollService = payrollService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    #region Timesheets
    [HttpGet("timesheets")]
    public async Task<ActionResult<IEnumerable<TimesheetDto>>> GetTimesheets(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? branchId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var timesheets = await _payrollService.GetTimesheetsAsync(employeeId, branchId, year, month);
        return Ok(timesheets);
    }

    [HttpGet("timesheets/{id}")]
    public async Task<ActionResult<TimesheetDto>> GetTimesheet(int id)
    {
        var timesheet = await _payrollService.GetTimesheetByIdAsync(id);
        if (timesheet == null) return NotFound();
        return Ok(timesheet);
    }

    [HttpPost("timesheets")]
    public async Task<ActionResult<TimesheetDto>> CreateTimesheet(CreateTimesheetDto dto)
    {
        var timesheet = await _payrollService.CreateTimesheetAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetTimesheet), new { id = timesheet.Id }, timesheet);
    }

    [HttpPut("timesheets/{id}")]
    public async Task<ActionResult<TimesheetDto>> UpdateTimesheet(int id, UpdateTimesheetDto dto)
    {
        var timesheet = await _payrollService.UpdateTimesheetAsync(id, dto);
        if (timesheet == null) return NotFound();
        return Ok(timesheet);
    }

    [HttpDelete("timesheets/{id}")]
    public async Task<IActionResult> DeleteTimesheet(int id)
    {
        var result = await _payrollService.DeleteTimesheetAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
    #endregion

    #region Bonuses
    [HttpGet("bonuses")]
    public async Task<ActionResult<IEnumerable<BonusDto>>> GetBonuses(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var bonuses = await _payrollService.GetBonusesAsync(employeeId, year, month);
        return Ok(bonuses);
    }

    [HttpGet("bonuses/{id}")]
    public async Task<ActionResult<BonusDto>> GetBonus(int id)
    {
        var bonus = await _payrollService.GetBonusByIdAsync(id);
        if (bonus == null) return NotFound();
        return Ok(bonus);
    }

    [HttpPost("bonuses")]
    public async Task<ActionResult<BonusDto>> CreateBonus(CreateBonusDto dto)
    {
        var bonus = await _payrollService.CreateBonusAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetBonus), new { id = bonus.Id }, bonus);
    }

    [HttpDelete("bonuses/{id}")]
    public async Task<IActionResult> DeleteBonus(int id)
    {
        var result = await _payrollService.DeleteBonusAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
    #endregion

    #region Advances
    [HttpGet("advances")]
    public async Task<ActionResult<IEnumerable<AdvanceDto>>> GetAdvances(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var advances = await _payrollService.GetAdvancesAsync(employeeId, year, month);
        return Ok(advances);
    }

    [HttpGet("advances/{id}")]
    public async Task<ActionResult<AdvanceDto>> GetAdvance(int id)
    {
        var advance = await _payrollService.GetAdvanceByIdAsync(id);
        if (advance == null) return NotFound();
        return Ok(advance);
    }

    [HttpPost("advances")]
    public async Task<ActionResult<AdvanceDto>> CreateAdvance(CreateAdvanceDto dto)
    {
        var advance = await _payrollService.CreateAdvanceAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetAdvance), new { id = advance.Id }, advance);
    }

    [HttpDelete("advances/{id}")]
    public async Task<IActionResult> DeleteAdvance(int id)
    {
        var result = await _payrollService.DeleteAdvanceAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
    #endregion

    #region Payroll Calculations
    [HttpGet("calculations")]
    public async Task<ActionResult<IEnumerable<PayrollCalculationDto>>> GetPayrollCalculations(
        [FromQuery] int? branchId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var calculations = await _payrollService.GetPayrollCalculationsAsync(branchId, year, month);
        return Ok(calculations);
    }

    [HttpGet("calculations/{id}")]
    public async Task<ActionResult<PayrollCalculationDto>> GetPayrollCalculation(int id)
    {
        var calculation = await _payrollService.GetPayrollCalculationByIdAsync(id);
        if (calculation == null) return NotFound();
        return Ok(calculation);
    }

    [HttpGet("calculations/{id}/detail")]
    public async Task<ActionResult<PayrollCalculationDetailDto>> GetPayrollCalculationDetail(int id)
    {
        var calculation = await _payrollService.GetPayrollCalculationDetailAsync(id);
        if (calculation == null) return NotFound();
        return Ok(calculation);
    }

    [HttpPost("calculations")]
    public async Task<ActionResult<PayrollCalculationDetailDto>> CreatePayrollCalculation(CreatePayrollCalculationDto dto)
    {
        try
        {
            var calculation = await _payrollService.CreatePayrollCalculationAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetPayrollCalculation), new { id = calculation.Id }, calculation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("calculations/{id}/calculate")]
    public async Task<ActionResult<PayrollCalculationDto>> CalculatePayroll(int id)
    {
        try
        {
            var calculation = await _payrollService.CalculatePayrollAsync(id, GetUserId());
            if (calculation == null) return NotFound();
            return Ok(calculation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("calculations/{id}/approve")]
    public async Task<ActionResult<PayrollCalculationDto>> ApprovePayroll(int id)
    {
        try
        {
            var calculation = await _payrollService.ApprovePayrollAsync(id, GetUserId());
            if (calculation == null) return NotFound();
            return Ok(calculation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("calculations/{id}/pay")]
    public async Task<ActionResult<PayrollCalculationDto>> MarkAsPaid(int id)
    {
        try
        {
            var calculation = await _payrollService.MarkAsPaidAsync(id, GetUserId());
            if (calculation == null) return NotFound();
            return Ok(calculation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("calculations/{id}/cancel")]
    public async Task<ActionResult<PayrollCalculationDto>> CancelPayroll(int id)
    {
        try
        {
            var calculation = await _payrollService.CancelPayrollAsync(id);
            if (calculation == null) return NotFound();
            return Ok(calculation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("calculations/{id}")]
    public async Task<IActionResult> DeletePayrollCalculation(int id)
    {
        try
        {
            var result = await _payrollService.DeletePayrollAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PayrollSummaryDto>> GetPayrollSummary(
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] int? branchId = null)
    {
        var summary = await _payrollService.GetPayrollSummaryAsync(year, month, branchId);
        return Ok(summary);
    }
    #endregion

    #region Employee Rate History
    [HttpGet("rates/{employeeId}")]
    public async Task<ActionResult<IEnumerable<EmployeeRateHistoryDto>>> GetEmployeeRateHistory(int employeeId)
    {
        var history = await _payrollService.GetEmployeeRateHistoryAsync(employeeId);
        return Ok(history);
    }

    [HttpPost("rates")]
    public async Task<ActionResult<EmployeeRateHistoryDto>> CreateEmployeeRateHistory(CreateEmployeeRateHistoryDto dto)
    {
        var history = await _payrollService.CreateEmployeeRateHistoryAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetEmployeeRateHistory), new { employeeId = history.EmployeeId }, history);
    }
    #endregion
}
