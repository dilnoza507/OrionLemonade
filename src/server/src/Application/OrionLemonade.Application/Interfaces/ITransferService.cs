using OrionLemonade.Application.DTOs;
using OrionLemonade.Domain.Enums;

namespace OrionLemonade.Application.Interfaces;

public interface ITransferService
{
    Task<IEnumerable<TransferDto>> GetTransfersAsync(int? branchId = null, TransferType? type = null, TransferStatus? status = null);
    Task<TransferDto?> GetTransferByIdAsync(int id);
    Task<TransferDetailDto?> GetTransferDetailAsync(int id);
    Task<TransferDetailDto> CreateTransferAsync(CreateTransferDto dto, int userId);
    Task<TransferDto?> SendTransferAsync(int id, int userId);
    Task<TransferDto?> ReceiveTransferAsync(int id, ReceiveTransferDto dto, int userId);
    Task<TransferDto?> CancelTransferAsync(int id);
    Task<bool> DeleteTransferAsync(int id);
}
