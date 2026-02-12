import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import ProductionPage from './pages/ProductionPage';
import MaterialsPage from './pages/MaterialsPage';
import ProductsPage from './pages/ProductsPage';
import ProductStockPage from './pages/ProductStockPage';
import TransfersPage from './pages/TransfersPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import SaleReturnsPage from './pages/SaleReturnsPage';
import ClientsPage from './pages/ClientsPage';
import PriceListsPage from './pages/PriceListsPage';
import ExpensesPage from './pages/ExpensesPage';
import PayrollPage from './pages/PayrollPage';
import ReportsPage from './pages/ReportsPage';

// Settings pages
import BranchesPage from './pages/settings/BranchesPage';
import EmployeesPage from './pages/settings/EmployeesPage';
import UsersPage from './pages/settings/UsersPage';
import ExchangeRatesPage from './pages/settings/ExchangeRatesPage';
import IngredientsPage from './pages/settings/IngredientsPage';
import ExpenseCategoriesPage from './pages/settings/ExpenseCategoriesPage';
import SuppliersPage from './pages/settings/SuppliersPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);

  if (!isAuthenticated || sessionExpired) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Production */}
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/production" element={<ProductionPage />} />

          {/* Warehouse */}
          <Route path="/warehouse/materials" element={<MaterialsPage />} />
          <Route path="/warehouse/products" element={<ProductStockPage />} />
          <Route path="/warehouse/transfers" element={<TransfersPage />} />
          <Route path="/warehouse/inventory" element={<InventoryPage />} />

          {/* Sales */}
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/returns" element={<SaleReturnsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/price-lists" element={<PriceListsPage />} />

          {/* Finance */}
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/payroll" element={<PayrollPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Settings */}
          <Route path="/settings/branches" element={<BranchesPage />} />
          <Route path="/settings/employees" element={<EmployeesPage />} />
          <Route path="/settings/users" element={<UsersPage />} />
          <Route path="/settings/exchange-rates" element={<ExchangeRatesPage />} />
          <Route path="/settings/ingredients" element={<IngredientsPage />} />
          <Route path="/settings/expense-categories" element={<ExpenseCategoriesPage />} />
          <Route path="/settings/suppliers" element={<SuppliersPage />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
