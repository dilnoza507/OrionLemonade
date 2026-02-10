using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface ISaleReturnService
{
    Task<IEnumerable<SaleReturnDto>> GetReturnsAsync(int? branchId = null, int? clientId = null, DateTime? from = null, DateTime? to = null);
    Task<SaleReturnDto?> GetReturnByIdAsync(int id);
    Task<SaleReturnDetailDto?> GetReturnDetailAsync(int id);
    Task<SaleReturnDetailDto> CreateReturnAsync(CreateSaleReturnDto dto, int userId);
    Task<SaleReturnDto?> UpdateReturnAsync(int id, UpdateSaleReturnDto dto);
    Task<bool> DeleteReturnAsync(int id);
}
