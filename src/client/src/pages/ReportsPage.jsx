import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Filter } from 'lucide-react';
import { getGeneralReport, exportGeneralReport } from '../api/reports';
import { getBranches } from '../api/branches';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      const data = await getBranches();
      setBranches(data.filter(b => b.status === 'Active'));
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  }

  async function loadReport() {
    try {
      setLoading(true);
      setError(null);
      const data = await getGeneralReport(startDate, endDate, branchId || null);
      setReport(data);
    } catch (err) {
      setError('Не удалось загрузить отчёт');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      const blob = await exportGeneralReport(startDate, endDate, branchId || null);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Отчёт_${startDate}_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Не удалось экспортировать отчёт');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  }

  const inputClass = "px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Общий отчёт</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Продажи, расходы и зарплата за период</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Начало периода</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Конец периода</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={inputClass + " min-w-[150px]"}
            >
              <option value="">Все филиалы</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={loadReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          >
            <Filter className="w-4 h-4" />
            {loading ? 'Загрузка...' : 'Сформировать'}
          </button>
          {report && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--success))] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Экспорт...' : 'Excel'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">
          {error}
        </div>
      )}

      {!report && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Выберите период</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Укажите даты и нажмите "Сформировать"</p>
          </div>
        </div>
      )}

      {report && (
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Report Header */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Период: {formatDate(report.startDate)} — {formatDate(report.endDate)}
              </span>
            </div>
          </div>

          {/* 1. Sales by Client */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">1. Продажи по клиентам</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Клиент</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Продаж</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Блоков</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Сумма (TJS)</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Оплачено (TJS)</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Долг (TJS)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.salesByClient.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                        Нет данных за выбранный период
                      </td>
                    </tr>
                  ) : (
                    <>
                      {report.salesByClient.map((item, index) => (
                        <tr key={item.clientId} className={index !== report.salesByClient.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">{item.clientName}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{item.salesCount}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{item.totalQuantity}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right font-medium">{formatMoney(item.totalAmount)}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--success))] text-right">{formatMoney(item.paidAmount)}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={item.debtAmount > 0 ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}>
                              {formatMoney(item.debtAmount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[hsl(var(--muted))]/50 font-semibold">
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">ИТОГО</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{report.salesTotals.totalSalesCount}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{report.salesTotals.totalQuantity}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(report.salesTotals.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--success))] text-right">{formatMoney(report.salesTotals.totalPaid)}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--destructive))] text-right">{formatMoney(report.salesTotals.totalDebt)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Expenses */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">2. Расходы</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Категория</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Сумма (TJS)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expensesByCategory.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                        Нет расходов за выбранный период
                      </td>
                    </tr>
                  ) : (
                    <>
                      {report.expensesByCategory.map((item, index) => (
                        <tr key={item.categoryId} className={index !== report.expensesByCategory.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">{item.categoryName}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right font-medium">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-[hsl(var(--muted))]/50 font-semibold">
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">ИТОГО расходов</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(report.expensesTotal)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Payroll */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">3. Зарплата</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Сотрудник</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Должность</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Дней</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Оклад</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Аванс</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Премия</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {report.payroll.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                        Нет данных о зарплате за выбранный период
                      </td>
                    </tr>
                  ) : (
                    <>
                      {report.payroll.map((item, index) => (
                        <tr key={item.employeeId} className={index !== report.payroll.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">{item.employeeName}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">{item.position || '-'}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{item.daysWorked}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(item.baseSalary)}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(item.advance)}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(item.bonus)}</td>
                          <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right font-medium">{formatMoney(item.netTotal)}</td>
                        </tr>
                      ))}
                      <tr className="bg-[hsl(var(--muted))]/50 font-semibold">
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]" colSpan={3}>ИТОГО</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(report.payrollTotals.totalBaseSalary)}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(report.payrollTotals.totalAdvance)}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(report.payrollTotals.totalBonus)}</td>
                        <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))] text-right">{formatMoney(report.payrollTotals.totalNet)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Summary */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">4. Итоговая сводка</h2>
            </div>
            <div className="p-4">
              <table className="w-full max-w-md">
                <tbody>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="py-3 text-sm text-[hsl(var(--foreground))]">Выручка</td>
                    <td className="py-3 text-sm text-[hsl(var(--foreground))] text-right font-medium">{formatMoney(report.summary.revenue)} TJS</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="py-3 text-sm text-[hsl(var(--foreground))]">Расходы</td>
                    <td className="py-3 text-sm text-[hsl(var(--destructive))] text-right font-medium">-{formatMoney(report.summary.expenses)} TJS</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <td className="py-3 text-sm text-[hsl(var(--foreground))]">Зарплата</td>
                    <td className="py-3 text-sm text-[hsl(var(--destructive))] text-right font-medium">-{formatMoney(report.summary.payroll)} TJS</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-base font-semibold text-[hsl(var(--foreground))]">Чистая прибыль</td>
                    <td className={`py-3 text-base text-right font-bold ${report.summary.netProfit >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                      {formatMoney(report.summary.netProfit)} TJS
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
