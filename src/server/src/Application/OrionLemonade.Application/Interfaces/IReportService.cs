using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IReportService
{
    Task<GeneralReportDto> GetGeneralReportAsync(GeneralReportRequest request, CancellationToken cancellationToken = default);
    Task<byte[]> ExportGeneralReportToExcelAsync(GeneralReportRequest request, CancellationToken cancellationToken = default);
}
