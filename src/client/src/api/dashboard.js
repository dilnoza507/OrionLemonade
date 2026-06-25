import { apiGet } from './client';

// Get dashboard summary data
export async function getDashboardSummary(branchId = null) {
  // Get current month range (UTC to avoid DateTimeKind mismatch in backend)
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const startOfMonth = new Date(Date.UTC(y, m, 1)).toISOString();
  const endOfMonth = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999)).toISOString();

  // Get last month range for comparison
  const startOfLastMonth = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const endOfLastMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)).toISOString();

  const branch = branchId ? `&branchId=${branchId}` : '';

  // Fetch all data in parallel
  const [
    salesThisMonth,
    salesLastMonth,
    expensesSummary,
    lowStockItems,
    recentProductions,
    recentReceipts
  ] = await Promise.all([
    apiGet(`/sales?from=${startOfMonth}&to=${endOfMonth}${branch}`).catch(() => []),
    apiGet(`/sales?from=${startOfLastMonth}&to=${endOfLastMonth}${branch}`).catch(() => []),
    apiGet(`/expenses/summary?from=${startOfMonth}&to=${endOfMonth}`).catch(() => []),
    apiGet(`/warehouse/stock/low${branchId ? `?branchId=${branchId}` : ''}`).catch(() => []),
    apiGet(`/production${branchId ? `?branchId=${branchId}` : ''}`).catch(() => []),
    apiGet(`/warehouse/receipts${branchId ? `?branchId=${branchId}` : ''}`).catch(() => [])
  ]);

  // Calculate sales revenue this month (total billed, excluding cancelled)
  const revenueThisMonth = salesThisMonth
    .filter(s => s.statusName !== 'Отменено')
    .reduce((sum, s) => sum + (s.totalTjs || 0), 0);

  // Calculate sales revenue last month
  const revenueLastMonth = salesLastMonth
    .filter(s => s.statusName !== 'Отменено')
    .reduce((sum, s) => sum + (s.totalTjs || 0), 0);

  // Calculate expenses this month (from summary)
  const expensesThisMonth = expensesSummary.reduce((sum, s) => sum + (s.totalAmountTjs || 0), 0);

  // Calculate revenue change percentage
  const revenueChange = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
    : 0;

  // Calculate profit
  const profit = revenueThisMonth - expensesThisMonth;
  const margin = revenueThisMonth > 0 ? (profit / revenueThisMonth * 100).toFixed(1) : 0;

  // Sales count this month (excluding cancelled)
  const salesCount = salesThisMonth.filter(s => s.statusName !== 'Отменено').length;

  // Recent operations (combine and sort)
  const recentOperations = [
    ...salesThisMonth.slice(0, 5).map(s => ({
      type: 'sale',
      text: `Продажа ${s.saleNumber} - ${s.totalTjs?.toLocaleString()} TJS`,
      date: s.saleDate,
      status: s.paymentStatus
    })),
    ...recentProductions.slice(0, 5).map(p => ({
      type: 'production',
      text: `Партия ${p.batchNumber} - ${p.recipeName}`,
      date: p.productionDate,
      status: p.status
    })),
    ...recentReceipts.slice(0, 5).map(r => ({
      type: 'receipt',
      text: `Приход: ${r.ingredientName} ${r.quantity} ${r.unit}`,
      date: r.receiptDate
    }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Low stock alerts
  const alerts = lowStockItems.map(item => ({
    type: 'warning',
    text: `Низкий остаток: ${item.ingredientName} (${item.currentStock} ${item.unit})`
  }));

  return {
    revenue: {
      value: revenueThisMonth,
      change: parseFloat(revenueChange),
      trend: parseFloat(revenueChange) >= 0 ? 'up' : 'down'
    },
    expenses: {
      value: expensesThisMonth
    },
    profit: {
      value: profit,
      margin: parseFloat(margin)
    },
    salesCount: {
      value: salesCount
    },
    recentOperations,
    alerts
  };
}
