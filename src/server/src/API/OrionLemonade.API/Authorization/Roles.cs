namespace OrionLemonade.API.Authorization;

/// <summary>
/// Role constants for authorization policies
/// Based on TZ 3.2 Access Matrix
/// </summary>
public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Director = "Director";
    public const string Accountant = "Accountant";
    public const string Manager = "Manager";
    public const string Storekeeper = "Storekeeper";

    // Combined role strings for [Authorize(Roles = "...")] attribute
    public const string AdminOrDirector = $"{SuperAdmin},{Director}";
    public const string AdminDirectorAccountant = $"{SuperAdmin},{Director},{Accountant}";
    public const string AdminDirectorManager = $"{SuperAdmin},{Director},{Manager}";
    public const string AdminDirectorAccountantManager = $"{SuperAdmin},{Director},{Accountant},{Manager}";
    public const string AdminDirectorManagerStorekeeper = $"{SuperAdmin},{Director},{Manager},{Storekeeper}";
    public const string AllRoles = $"{SuperAdmin},{Director},{Accountant},{Manager},{Storekeeper}";

    // Specific combinations from access matrix
    public const string RecipesView = $"{SuperAdmin},{Director},{Accountant},{Manager}";
    public const string RecipesEdit = $"{SuperAdmin},{Director},{Manager},{Storekeeper}";
    public const string ProductionCreate = $"{SuperAdmin},{Director},{Manager},{Storekeeper}";
    public const string ProductionView = AllRoles;
    public const string WarehouseReceipt = $"{SuperAdmin},{Director},{Manager},{Storekeeper}";
    public const string WarehouseView = AllRoles;
    public const string ClientsManage = $"{SuperAdmin},{Director},{Manager}";
    public const string SalesCreate = $"{SuperAdmin},{Director},{Manager}";
    public const string SalesView = $"{SuperAdmin},{Director},{Accountant},{Manager}";
    public const string ExpensesManage = $"{SuperAdmin},{Director},{Accountant}";
    public const string PayrollManage = $"{SuperAdmin},{Director},{Accountant}";
    public const string EmployeesManage = AdminOrDirector;
    public const string SettingsUsers = AdminOrDirector;
    public const string SettingsBranches = AdminOrDirector;
    public const string SettingsCategories = $"{SuperAdmin},{Director},{Accountant}";
    public const string SettingsExchangeRates = $"{SuperAdmin},{Director},{Accountant}";
    public const string SettingsSuppliers = $"{SuperAdmin},{Director},{Accountant}";
    public const string SettingsIngredients = $"{SuperAdmin},{Director},{Storekeeper}";
    public const string AuditLogView = AdminOrDirector;
}
