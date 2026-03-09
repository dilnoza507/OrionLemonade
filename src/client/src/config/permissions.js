// Access matrix based on TZ 3.2
// Roles: SuperAdmin, Director, Accountant, Manager, Storekeeper

export const PERMISSIONS = {
  // Recipes
  RECIPES_VIEW: ['SuperAdmin', 'Director', 'Accountant', 'Manager'],
  RECIPES_EDIT: ['SuperAdmin', 'Director', 'Manager', 'Storekeeper'],

  // Production
  PRODUCTION_CREATE: ['SuperAdmin', 'Director', 'Manager', 'Storekeeper'],
  PRODUCTION_VIEW: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],

  // Warehouse (Ingredients)
  WAREHOUSE_RECEIPT: ['SuperAdmin', 'Director', 'Manager', 'Storekeeper'],
  WAREHOUSE_VIEW: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],

  // Product Stock
  PRODUCT_STOCK_VIEW: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],

  // Clients
  CLIENTS_MANAGE: ['SuperAdmin', 'Director', 'Manager'],

  // Sales
  SALES_CREATE: ['SuperAdmin', 'Director', 'Manager'],
  SALES_VIEW: ['SuperAdmin', 'Director', 'Accountant', 'Manager'],

  // Expenses
  EXPENSES_CREATE: ['SuperAdmin', 'Director', 'Accountant'],
  EXPENSES_VIEW: ['SuperAdmin', 'Director', 'Accountant'],

  // Payroll
  PAYROLL_CALCULATE: ['SuperAdmin', 'Director', 'Accountant'],
  PAYROLL_VIEW: ['SuperAdmin', 'Director', 'Accountant'],

  // Employees
  EMPLOYEES_MANAGE: ['SuperAdmin', 'Director'],

  // Reports
  REPORTS_FINANCIAL: ['SuperAdmin', 'Director', 'Accountant'],
  REPORTS_SALES: ['SuperAdmin', 'Director', 'Accountant', 'Manager'],
  REPORTS_WAREHOUSE: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],

  // Settings
  SETTINGS_USERS: ['SuperAdmin', 'Director'],
  SETTINGS_BRANCHES: ['SuperAdmin', 'Director'],
  SETTINGS_CATEGORIES: ['SuperAdmin', 'Director', 'Accountant'],
  SETTINGS_EXCHANGE_RATES: ['SuperAdmin', 'Director', 'Accountant'],
  SETTINGS_SUPPLIERS: ['SuperAdmin', 'Director', 'Accountant'],
  SETTINGS_INGREDIENTS: ['SuperAdmin', 'Director', 'Storekeeper'],

  // Audit Log
  AUDIT_LOG_VIEW: ['SuperAdmin', 'Director'],
};

// Check if user has permission
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

// Check if user has any of the permissions
export function hasAnyPermission(userRole, permissions) {
  return permissions.some(p => hasPermission(userRole, p));
}

// Check if user has all permissions
export function hasAllPermissions(userRole, permissions) {
  return permissions.every(p => hasPermission(userRole, p));
}

// Menu items visibility config
export const MENU_PERMISSIONS = {
  // Main menu
  dashboard: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],
  sales: ['SuperAdmin', 'Director', 'Accountant', 'Manager'],
  clients: ['SuperAdmin', 'Director', 'Manager'],
  production: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],
  recipes: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],
  warehouse: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],
  products: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],
  transfers: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],
  expenses: ['SuperAdmin', 'Director', 'Accountant'],
  employees: ['SuperAdmin', 'Director'],
  payroll: ['SuperAdmin', 'Director', 'Accountant'],
  reports: ['SuperAdmin', 'Director', 'Accountant', 'Manager', 'Storekeeper'],

  // Settings submenu
  'settings/users': ['SuperAdmin', 'Director'],
  'settings/branches': ['SuperAdmin', 'Director'],
  'settings/categories': ['SuperAdmin', 'Director', 'Accountant'],
  'settings/exchange-rates': ['SuperAdmin', 'Director', 'Accountant'],
  'settings/suppliers': ['SuperAdmin', 'Director', 'Accountant'],
  'settings/ingredients': ['SuperAdmin', 'Director', 'Storekeeper'],
  'settings/audit-log': ['SuperAdmin', 'Director'],
};

// Check if menu item is visible for user role
export function canAccessMenu(userRole, menuKey) {
  if (!userRole || !menuKey) return false;
  const allowedRoles = MENU_PERMISSIONS[menuKey];
  if (!allowedRoles) return true; // If not specified, allow access
  return allowedRoles.includes(userRole);
}

// Roles that are branch-scoped (see only their branch data)
export const BRANCH_SCOPED_ROLES = ['Manager', 'Storekeeper'];

export function isBranchScoped(userRole) {
  return BRANCH_SCOPED_ROLES.includes(userRole);
}
