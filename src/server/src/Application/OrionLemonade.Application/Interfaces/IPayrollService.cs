using OrionLemonade.Application.DTOs;

namespace OrionLemonade.Application.Interfaces;

public interface IPayrollService
{
    // Timesheets
    Task<IEnumerable<TimesheetDto>> GetTimesheetsAsync(int? employeeId = null, int? branchId = null, int? year = null, int? month = null);
    Task<TimesheetDto?> GetTimesheetByIdAsync(int id);
    Task<TimesheetDto> CreateTimesheetAsync(CreateTimesheetDto dto, int userId);
    Task<TimesheetDto?> UpdateTimesheetAsync(int id, UpdateTimesheetDto dto);
    Task<bool> DeleteTimesheetAsync(int id);

    // Bonuses
    Task<IEnumerable<BonusDto>> GetBonusesAsync(int? employeeId = null, int? year = null, int? month = null);
    Task<BonusDto?> GetBonusByIdAsync(int id);
    Task<BonusDto> CreateBonusAsync(CreateBonusDto dto, int userId);
    Task<bool> DeleteBonusAsync(int id);

    // Advances
    Task<IEnumerable<AdvanceDto>> GetAdvancesAsync(int? employeeId = null, int? year = null, int? month = null);
    Task<AdvanceDto?> GetAdvanceByIdAsync(int id);
    Task<AdvanceDto> CreateAdvanceAsync(CreateAdvanceDto dto, int userId);
    Task<bool> DeleteAdvanceAsync(int id);

    // Payroll Calculations
    Task<IEnumerable<PayrollCalculationDto>> GetPayrollCalculationsAsync(int? branchId = null, int? year = null, int? month = null);
    Task<PayrollCalculationDto?> GetPayrollCalculationByIdAsync(int id);
    Task<PayrollCalculationDetailDto?> GetPayrollCalculationDetailAsync(int id);
    Task<PayrollCalculationDetailDto> CreatePayrollCalculationAsync(CreatePayrollCalculationDto dto, int userId);
    Task<PayrollCalculationDto?> CalculatePayrollAsync(int id, int userId);
    Task<PayrollCalculationDto?> ApprovePayrollAsync(int id, int userId);
    Task<PayrollCalculationDto?> MarkAsPaidAsync(int id, int userId);
    Task<PayrollCalculationDto?> CancelPayrollAsync(int id);
    Task<bool> DeletePayrollAsync(int id);
    Task<PayrollSummaryDto> GetPayrollSummaryAsync(int year, int month, int? branchId = null);

    // Employee Rate History
    Task<IEnumerable<EmployeeRateHistoryDto>> GetEmployeeRateHistoryAsync(int employeeId);
    Task<EmployeeRateHistoryDto> CreateEmployeeRateHistoryAsync(CreateEmployeeRateHistoryDto dto, int userId);
}
