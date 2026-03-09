using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrionLemonade.API.Authorization;
using OrionLemonade.Application.DTOs;
using OrionLemonade.Application.Interfaces;

namespace OrionLemonade.API.Controllers;

[Authorize(Roles = Roles.AdminDirectorAccountant)]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("general")]
    public async Task<ActionResult<GeneralReportDto>> GetGeneralReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? branchId,
        CancellationToken cancellationToken)
    {
        var request = new GeneralReportRequest
        {
            StartDate = startDate,
            EndDate = endDate,
            BranchId = branchId
        };

        var report = await _reportService.GetGeneralReportAsync(request, cancellationToken);
        return Ok(report);
    }

    [HttpGet("general/export")]
    public async Task<IActionResult> ExportGeneralReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? branchId,
        CancellationToken cancellationToken)
    {
        var request = new GeneralReportRequest
        {
            StartDate = startDate,
            EndDate = endDate,
            BranchId = branchId
        };

        var bytes = await _reportService.ExportGeneralReportToExcelAsync(request, cancellationToken);
        var fileName = $"Отчёт_{startDate:yyyy-MM-dd}_{endDate:yyyy-MM-dd}.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}
