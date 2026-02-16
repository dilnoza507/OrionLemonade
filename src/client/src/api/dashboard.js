import { apiGet } from './client';

// Get dashboard summary data
export async function getDashboardSummary() {
  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Get last month range for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  // Fetch all data in parallel
  const [
    salesThisMonth,
    salesLastMonth,
    expensesSummary,
    lowStockItems,
    recentProductions,
    recentReceipts
  ] = await Promise.all([
    apiGet(`/sales?dateFrom=${startOfMonth}&dateTo=${endOfMonth}`).catch(() => []),
    apiGet(`/sales?dateFrom=${startOfLastMonth}&dateTo=${endOfLastMonth}`).catch(() => []),
    apiGet('/expenses/summary').catch(() => []),
    apiGet('/warehouse/stock/low').catch(() => []),
    apiGet('/production').catch(() => []),
    apiGet('/warehouse/receipts').catch(() => [])
  ]);

  // Calculate sales revenue this month
  const revenueThisMonth = salesThisMonth
    .filter(s => s.paymentStatus === 'Paid' || s.paymentStatus === 'PartiallyPaid')
    .reduce((sum, s) => sum + (s.paidAmount || 0), 0);

  // Calculate sales revenue last month
  const revenueLastMonth = salesLastMonth
    .filter(s => s.paymentStatus === 'Paid' || s.paymentStatus === 'PartiallyPaid')
    .reduce((sum, s) => sum + (s.paidAmount || 0), 0);

  // Calculate expenses this month (from summary)
  const expensesThisMonth = expensesSummary.reduce((sum, s) => sum + (s.totalAmountTjs || 0), 0);

  // Calculate revenue change percentage
  const revenueChange = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
    : 0;

  // Calculate profit
  const profit = revenueThisMonth - expensesThisMonth;
  const margin = revenueThisMonth > 0 ? (profit / revenueThisMonth * 100).toFixed(1) : 0;

  // Sales count this month
  const salesCount = salesThisMonth.length;

  // Recent operations (combine and sort)
  const recentOperations = [
    ...salesThisMonth.slice(0, 5).map(s => ({
      type: 'sale',
      text: `Продажа ${s.saleNumber} - ${s.totalAmount?.toLocaleString()} TJS`,
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
