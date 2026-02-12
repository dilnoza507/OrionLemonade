using Microsoft.Extensions.DependencyInjection;
using OrionLemonade.Application.Interfaces;
using OrionLemonade.Application.Mapping;
using OrionLemonade.Application.Services;

namespace OrionLemonade.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        services.AddScoped<IItemService, ItemService>();
        services.AddScoped<IBranchService, BranchService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUserBranchService, UserBranchService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IExchangeRateService, ExchangeRateService>();
        services.AddScoped<IIngredientService, IngredientService>();
        services.AddScoped<IExpenseCategoryService, ExpenseCategoryService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<IProductionService, ProductionService>();
        services.AddScoped<IProductStockService, ProductStockService>();
        services.AddScoped<IPriceListService, PriceListService>();
        services.AddScoped<ISaleService, SaleService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<ISaleReturnService, SaleReturnService>();
        services.AddScoped<ITransferService, TransferService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IPayrollService, PayrollService>();

        return services;
    }
}
