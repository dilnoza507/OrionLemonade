import { useState, useEffect } from 'react';
import { Calculator, Clock, Gift, Wallet, FileText, TrendingUp, Plus, Trash2, X, Play, CheckCircle, DollarSign, XCircle, Eye, Download } from 'lucide-react';
import {
  getTimesheets, createTimesheet, updateTimesheet, deleteTimesheet,
  getBonuses, createBonus, deleteBonus,
  getAdvances, createAdvance, deleteAdvance,
  getPayrollCalculations, getPayrollCalculationDetail, createPayrollCalculation,
  calculatePayroll, approvePayroll, markPayrollAsPaid, cancelPayroll, deletePayrollCalculation,
  getPayrollSummary, getEmployeeRateHistory, createEmployeeRateHistory
} from '../api/payroll';
import { getBranches } from '../api/branches';
import { getEmployees } from '../api/employees';

const statusColors = {
  'Черновик': 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  'Рассчитано': 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  'Утверждено': 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  'Оплачено': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Отменено': 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";
const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]";
const buttonPrimary = "px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50";
const buttonSecondary = "px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState('calculations');
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [branchesData, employeesData] = await Promise.all([
        getBranches(),
        getEmployees()
      ]);
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setEmployees(employeesData.filter(e => e.status === 'Active'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'calculations', label: 'Расчёт зарплаты', icon: Calculator },
    { id: 'timesheets', label: 'Табель', icon: Clock },
    { id: 'bonuses', label: 'Премии/Штрафы', icon: Gift },
    { id: 'advances', label: 'Авансы', icon: Wallet },
    { id: 'rates', label: 'Ставки', icon: TrendingUp },
  ];

  const months = [
    { value: 1, label: 'Январь' }, { value: 2, label: 'Февраль' }, { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' }, { value: 5, label: 'Май' }, { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' }, { value: 8, label: 'Август' }, { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' }, { value: 11, label: 'Ноябрь' }, { value: 12, label: 'Декабрь' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (loading) {
    return <div className="p-6 text-[hsl(var(--muted-foreground))]">Загрузка...</div>;
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Error */}
      {error && (
        <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-xl p-4 text-[hsl(var(--destructive))]">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Закрыть</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[hsl(var(--border))] pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <option value="">Все филиалы</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {activeTab !== 'calculations' && (
          <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <option value="">Все сотрудники</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
        )}
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] w-24">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] w-32">
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'calculations' && (
          <PayrollCalculationsTab
            branches={branches}
            employees={employees}
            selectedBranch={selectedBranch}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setError={setError}
          />
        )}
        {activeTab === 'timesheets' && (
          <TimesheetsTab
            branches={branches}
            employees={employees}
            selectedBranch={selectedBranch}
            selectedEmployee={selectedEmployee}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setError={setError}
          />
        )}
        {activeTab === 'bonuses' && (
          <BonusesTab
            employees={employees}
            selectedEmployee={selectedEmployee}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setError={setError}
          />
        )}
        {activeTab === 'advances' && (
          <AdvancesTab
            employees={employees}
            selectedEmployee={selectedEmployee}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            setError={setError}
          />
        )}
        {activeTab === 'rates' && (
          <RatesTab
            employees={employees}
            selectedEmployee={selectedEmployee}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}

function PayrollCalculationsTab({ branches, employees, selectedBranch, selectedYear, selectedMonth, setError }) {
  const [calculations, setCalculations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedYear, selectedMonth]);

  async function loadData() {
    setLoading(true);
    try {
      const [calcs, sum] = await Promise.all([
        getPayrollCalculations(selectedBranch || null, selectedYear, selectedMonth),
        getPayrollSummary(selectedYear, selectedMonth, selectedBranch || null)
      ]);
      setCalculations(calcs);
      setSummary(sum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculate(id) {
    try {
      await calculatePayroll(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApprove(id) {
    if (!confirm('Утвердить расчёт зарплаты?')) return;
    try {
      await approvePayroll(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePay(id) {
    if (!confirm('Отметить как оплаченную?')) return;
    try {
      await markPayrollAsPaid(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    if (!confirm('Отменить расчёт?')) return;
    try {
      await cancelPayroll(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить расчёт?')) return;
    try {
      await deletePayrollCalculation(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(id) {
    try {
      const detail = await getPayrollCalculationDetail(id);
      setSelectedCalculation(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className={mutedClass}>Загрузка...</div>;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`${mutedClass} text-sm`}>Всего сотрудников</p>
            <p className={`text-2xl font-bold ${textClass}`}>{summary.totalEmployees}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`${mutedClass} text-sm`}>Начислено (брутто)</p>
            <p className={`text-2xl font-bold ${textClass}`}>{summary.totalGross.toLocaleString()} TJS</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`${mutedClass} text-sm`}>К выплате (нетто)</p>
            <p className={`text-2xl font-bold ${textClass}`}>{summary.totalNet.toLocaleString()} TJS</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`${mutedClass} text-sm`}>Статус</p>
            <div className="flex gap-2 text-xs mt-1">
              <span className="px-2 py-0.5 bg-[hsl(var(--muted))] rounded">{summary.draftCount} черн.</span>
              <span className="px-2 py-0.5 bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] rounded">{summary.calculatedCount} расч.</span>
              <span className="px-2 py-0.5 bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] rounded">{summary.approvedCount} утв.</span>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">{summary.paidCount} опл.</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button onClick={() => setShowCreateModal(true)} className={buttonPrimary + " flex items-center gap-2"}>
          <Plus className="w-4 h-4" />
          Создать расчёт
        </button>
      </div>

      {/* Table */}
      <div className={`${cardClass} overflow-auto`}>
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Сотрудник</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Должность</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Статус</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Брутто</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Нетто</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {calculations.length === 0 ? (
              <tr><td colSpan={7} className={`p-8 text-center ${mutedClass}`}>Нет расчётов за выбранный период</td></tr>
            ) : (
              calculations.map(calc => (
                <tr key={calc.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass} font-medium`}>{calc.employeeName}</td>
                  <td className={`p-3 ${mutedClass}`}>{calc.employeePosition || '-'}</td>
                  <td className={`p-3 ${textClass}`}>{calc.branchName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[calc.statusName] || ''}`}>
                      {calc.statusName}
                    </span>
                  </td>
                  <td className={`p-3 text-right ${textClass}`}>{calc.grossTotal.toLocaleString()}</td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{calc.netTotal.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleViewDetail(calc.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg" title="Детали">
                        <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                      {calc.statusName === 'Черновик' && (
                        <>
                          <button onClick={() => handleCalculate(calc.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg" title="Рассчитать">
                            <Play className="w-4 h-4 text-[hsl(var(--primary))]" />
                          </button>
                          <button onClick={() => handleDelete(calc.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg" title="Удалить">
                            <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                          </button>
                        </>
                      )}
                      {calc.statusName === 'Рассчитано' && (
                        <>
                          <button onClick={() => handleApprove(calc.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg" title="Утвердить">
                            <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))]" />
                          </button>
                          <button onClick={() => handleCancel(calc.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg" title="Отменить">
                            <XCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
                          </button>
                        </>
                      )}
                      {calc.statusName === 'Утверждено' && (
                        <button onClick={() => handlePay(calc.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg" title="Оплатить">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePayrollModal
          branches={branches}
          employees={employees}
          defaultYear={selectedYear}
          defaultMonth={selectedMonth}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadData();
          }}
          setError={setError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCalculation && (
        <PayrollDetailModal
          calculation={selectedCalculation}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCalculation(null);
          }}
        />
      )}
    </div>
  );
}

function CreatePayrollModal({ branches, employees, defaultYear, defaultMonth, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    employeeId: employees.length > 0 ? employees[0].id.toString() : '',
    branchId: branches.length > 0 ? branches[0].id.toString() : '',
    year: defaultYear,
    month: defaultMonth
  });
  const [saving, setSaving] = useState(false);

  const selectedEmployee = employees.find(e => e.id.toString() === form.employeeId);
  useEffect(() => {
    if (selectedEmployee?.branchId) {
      setForm(f => ({ ...f, branchId: selectedEmployee.branchId.toString() }));
    }
  }, [form.employeeId, selectedEmployee]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createPayrollCalculation({
        employeeId: parseInt(form.employeeId),
        branchId: parseInt(form.branchId),
        year: form.year,
        month: form.month
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Создать расчёт зарплаты" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Сотрудник</label>
          <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className={inputClass} required>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Филиал</label>
          <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className={inputClass} required>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Год</label>
            <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Месяц</label>
            <select value={form.month} onChange={e => setForm({ ...form, month: parseInt(e.target.value) })} className={inputClass}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'][m-1]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={buttonSecondary}>Отмена</button>
          <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? 'Создание...' : 'Создать'}</button>
        </div>
      </form>
    </Modal>
  );
}

function PayrollDetailModal({ calculation, onClose }) {
  return (
    <Modal title={`Расчёт зарплаты: ${calculation.employeeName}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={mutedClass + " text-sm"}>Период</p>
            <p className={textClass}>{calculation.periodName}</p>
          </div>
          <div>
            <p className={mutedClass + " text-sm"}>Статус</p>
            <span className={`px-2 py-1 rounded text-xs ${statusColors[calculation.statusName]}`}>{calculation.statusName}</span>
          </div>
          <div>
            <p className={mutedClass + " text-sm"}>Филиал</p>
            <p className={textClass}>{calculation.branchName}</p>
          </div>
          <div>
            <p className={mutedClass + " text-sm"}>Должность</p>
            <p className={textClass}>{calculation.employeePosition || '-'}</p>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-4">
          <p className="font-medium mb-2">Начисления и удержания</p>
          <div className="space-y-2 max-h-60 overflow-auto">
            {calculation.items?.map(item => (
              <div key={item.id} className={`flex justify-between p-2 rounded ${item.amount < 0 ? 'bg-[hsl(var(--destructive))]/10' : 'bg-[hsl(var(--muted))]/30'}`}>
                <div>
                  <p className={textClass}>{item.description}</p>
                  <p className={mutedClass + " text-sm"}>{item.itemTypeName} {item.quantity > 1 && `× ${item.quantity}`}</p>
                </div>
                <p className={`font-medium ${item.amount < 0 ? 'text-[hsl(var(--destructive))]' : textClass}`}>
                  {item.amount >= 0 ? '+' : ''}{item.amount.toLocaleString()} TJS
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[hsl(var(--border))] pt-4">
          <div>
            <p className={mutedClass + " text-sm"}>Начислено (брутто)</p>
            <p className={`text-xl font-bold ${textClass}`}>{calculation.grossTotal.toLocaleString()} TJS</p>
          </div>
          <div>
            <p className={mutedClass + " text-sm"}>К выплате (нетто)</p>
            <p className="text-xl font-bold text-[hsl(var(--primary))]">{calculation.netTotal.toLocaleString()} TJS</p>
          </div>
        </div>

        {calculation.calculatedAt && (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Рассчитано: {new Date(calculation.calculatedAt).toLocaleString()} ({calculation.calculatedByUserLogin})
          </div>
        )}
        {calculation.approvedAt && (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Утверждено: {new Date(calculation.approvedAt).toLocaleString()} ({calculation.approvedByUserLogin})
          </div>
        )}
        {calculation.paidAt && (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Оплачено: {new Date(calculation.paidAt).toLocaleString()}
          </div>
        )}
      </div>
    </Modal>
  );
}

function TimesheetsTab({ branches, employees, selectedBranch, selectedEmployee, selectedYear, selectedMonth, setError }) {
  const [timesheets, setTimesheets] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [editCell, setEditCell] = useState(null); // { employeeId, day }
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedEmployee, selectedYear, selectedMonth]);

  async function loadData() {
    setLoading(true);
    try {
      const [timesheetsData, bonusesData, advancesData] = await Promise.all([
        getTimesheets(null, selectedBranch || null, selectedYear, selectedMonth),
        getBonuses(null, selectedYear, selectedMonth),
        getAdvances(null, selectedYear, selectedMonth)
      ]);
      setTimesheets(timesheetsData);
      setBonuses(bonusesData);
      setAdvances(advancesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Get days in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get day of week (0=Sun, 1=Mon, ...)
  const getDayOfWeek = (day) => new Date(selectedYear, selectedMonth - 1, day).getDay();
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const isWeekend = (day) => {
    const dow = getDayOfWeek(day);
    return dow === 0 || dow === 6;
  };

  // Filter employees
  const filteredEmployees = employees.filter(e => {
    if (selectedBranch && e.branchId !== parseInt(selectedBranch)) return false;
    if (selectedEmployee && e.id !== parseInt(selectedEmployee)) return false;
    return true;
  });

  // Build timesheet map: employeeId -> day -> hours
  const timesheetMap = {};
  const timesheetIdMap = {}; // employeeId -> day -> timesheetId
  timesheets.forEach(t => {
    const day = new Date(t.workDate).getDate();
    if (!timesheetMap[t.employeeId]) {
      timesheetMap[t.employeeId] = {};
      timesheetIdMap[t.employeeId] = {};
    }
    timesheetMap[t.employeeId][day] = t.hoursWorked;
    timesheetIdMap[t.employeeId][day] = t.id;
  });

  // Build advance/bonus maps per employee
  const advanceMap = {}; // employeeId -> total advance
  const bonusMap = {}; // employeeId -> { bonus, penalty }
  advances.forEach(a => {
    if (!advanceMap[a.employeeId]) advanceMap[a.employeeId] = 0;
    advanceMap[a.employeeId] += a.amount;
  });
  bonuses.forEach(b => {
    if (!bonusMap[b.employeeId]) bonusMap[b.employeeId] = { bonus: 0, penalty: 0 };
    if (b.bonusType === 'Bonus') {
      bonusMap[b.employeeId].bonus += b.amount;
    } else {
      bonusMap[b.employeeId].penalty += b.amount;
    }
  });

  // Calculate totals for each employee
  const getEmployeeTotals = (emp) => {
    const hours = Object.values(timesheetMap[emp.id] || {}).reduce((sum, h) => sum + h, 0);
    const daysWorked = Object.keys(timesheetMap[emp.id] || {}).length;
    const dailyRate = emp.dailyRate || 0;
    const sumSalary = daysWorked * dailyRate;
    const advance = advanceMap[emp.id] || 0;
    const bonus = bonusMap[emp.id]?.bonus || 0;
    const penalty = bonusMap[emp.id]?.penalty || 0;
    const netPay = sumSalary - advance + bonus - penalty;
    return { hours, daysWorked, sumSalary, advance, bonus, penalty, netPay };
  };

  // Grand totals
  const grandTotalHours = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).hours, 0);
  const grandTotalDays = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).daysWorked, 0);
  const grandTotalSum = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).sumSalary, 0);
  const grandTotalAdvance = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).advance, 0);
  const grandTotalBonus = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).bonus, 0);
  const grandTotalPenalty = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).penalty, 0);
  const grandTotalNet = filteredEmployees.reduce((sum, e) => sum + getEmployeeTotals(e).netPay, 0);

  // Excel export function
  function exportToExcel() {
    const monthNames = ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    // Build CSV content
    let csv = '\uFEFF'; // UTF-8 BOM for Excel

    // Header row
    const headers = ['№', 'Сотрудник', 'Ставка'];
    days.forEach(d => headers.push(d.toString()));
    headers.push('Часов', 'Дней', 'Аванс', 'Премия', 'Штраф', 'Сумма', 'На руки');
    csv += headers.join(';') + '\n';

    // Data rows
    filteredEmployees.forEach((emp, idx) => {
      const totals = getEmployeeTotals(emp);
      const row = [
        idx + 1,
        emp.fullName,
        emp.dailyRate || 0
      ];
      days.forEach(day => {
        row.push(timesheetMap[emp.id]?.[day] || '');
      });
      row.push(totals.hours, totals.daysWorked, totals.advance, totals.bonus, totals.penalty, totals.sumSalary, totals.netPay);
      csv += row.join(';') + '\n';
    });

    // Totals row
    const totalRow = ['', 'ИТОГО', ''];
    days.forEach(day => {
      const dayTotal = filteredEmployees.reduce((sum, e) => sum + (timesheetMap[e.id]?.[day] || 0), 0);
      totalRow.push(dayTotal || '');
    });
    totalRow.push(grandTotalHours, grandTotalDays, grandTotalAdvance, grandTotalBonus, grandTotalPenalty, grandTotalSum, grandTotalNet);
    csv += totalRow.join(';') + '\n';

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Табель_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function handleCellClick(employee, day) {
    const existing = timesheetMap[employee.id]?.[day];
    setEditCell({ employeeId: employee.id, day, employee });
    setEditValue(existing?.toString() || '8');
  }

  async function handleCellSave() {
    if (!editCell) return;
    const { employeeId, day, employee } = editCell;
    const hours = parseFloat(editValue);

    try {
      const existingId = timesheetIdMap[employeeId]?.[day];

      if (hours > 0) {
        if (existingId) {
          await updateTimesheet(existingId, { hoursWorked: hours, overtimeHours: null, notes: null });
        } else {
          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          await createTimesheet({
            employeeId,
            branchId: employee.branchId,
            workDate: dateStr,
            hoursWorked: hours,
            overtimeHours: null,
            notes: null
          });
        }
      } else if (existingId) {
        await deleteTimesheet(existingId);
      }
      setEditCell(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const months = ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  if (loading) return <div className={mutedClass}>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={exportToExcel} className={buttonPrimary + " flex items-center gap-2"}>
          <Download className="w-4 h-4" />
          Экспорт в Excel
        </button>
      </div>
      <div className={`${cardClass} overflow-auto`}>
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-[hsl(var(--card))] z-10">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`p-2 text-left ${mutedClass} font-medium border-r border-[hsl(var(--border))] sticky left-0 bg-[hsl(var(--card))] z-20`}>#</th>
              <th className={`p-2 text-left ${mutedClass} font-medium border-r border-[hsl(var(--border))] sticky left-8 bg-[hsl(var(--card))] z-20 min-w-[140px]`}>Сотрудник</th>
              <th className={`p-2 text-right ${mutedClass} font-medium border-r border-[hsl(var(--border))] min-w-[70px]`}>Ставка</th>
              {days.map(day => (
                <th key={day} className={`p-1 text-center font-medium min-w-[32px] ${isWeekend(day) ? 'bg-[hsl(var(--warning))]/10' : ''}`}>
                  <div className={`text-[10px] ${mutedClass}`}>{dayNames[getDayOfWeek(day)]}</div>
                  <div className={textClass}>{day}</div>
                </th>
              ))}
              <th className={`p-2 text-center ${mutedClass} font-medium border-l border-[hsl(var(--border))] min-w-[50px] bg-[hsl(var(--muted))]/30`}>Часов</th>
              <th className={`p-2 text-center ${mutedClass} font-medium min-w-[50px] bg-[hsl(var(--muted))]/30`}>Дней</th>
              <th className={`p-2 text-right ${mutedClass} font-medium min-w-[70px] bg-[hsl(var(--warning))]/10`}>Аванс</th>
              <th className={`p-2 text-right ${mutedClass} font-medium min-w-[70px] bg-green-100/50 dark:bg-green-900/20`}>Премия</th>
              <th className={`p-2 text-right ${mutedClass} font-medium min-w-[70px] bg-[hsl(var(--destructive))]/10`}>Штраф</th>
              <th className={`p-2 text-right ${mutedClass} font-medium min-w-[80px] bg-[hsl(var(--primary))]/10`}>Сумма</th>
              <th className={`p-2 text-right ${mutedClass} font-medium min-w-[90px] bg-[hsl(var(--primary))]/20`}>На руки</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr><td colSpan={days.length + 10} className={`p-8 text-center ${mutedClass}`}>Нет сотрудников</td></tr>
            ) : (
              filteredEmployees.map((emp, idx) => {
                const totals = getEmployeeTotals(emp);
                return (
                  <tr key={emp.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30">
                    <td className={`p-2 text-center ${mutedClass} border-r border-[hsl(var(--border))] sticky left-0 bg-[hsl(var(--card))]`}>{idx + 1}</td>
                    <td className={`p-2 ${textClass} font-medium border-r border-[hsl(var(--border))] sticky left-8 bg-[hsl(var(--card))] truncate max-w-[140px]`} title={emp.fullName}>{emp.fullName}</td>
                    <td className={`p-2 text-right ${mutedClass} border-r border-[hsl(var(--border))]`}>{emp.dailyRate || '-'}</td>
                    {days.map(day => {
                      const hours = timesheetMap[emp.id]?.[day];
                      const isEditing = editCell?.employeeId === emp.id && editCell?.day === day;
                      return (
                        <td
                          key={day}
                          onClick={() => !isEditing && handleCellClick(emp, day)}
                          className={`p-0 text-center cursor-pointer border border-[hsl(var(--border))]/30 ${isWeekend(day) ? 'bg-[hsl(var(--warning))]/5' : ''} ${hours ? 'bg-[hsl(var(--primary))]/10' : ''} hover:bg-[hsl(var(--primary))]/20`}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={e => e.key === 'Enter' && handleCellSave()}
                              className="w-full h-full p-1 text-center bg-[hsl(var(--primary))]/20 border-0 outline-none text-sm"
                              autoFocus
                              min="0"
                              max="24"
                              step="0.5"
                            />
                          ) : (
                            <span className={`block py-1 ${hours ? 'text-[hsl(var(--primary))] font-medium' : mutedClass}`}>
                              {hours || ''}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className={`p-2 text-center font-bold ${textClass} border-l border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30`}>{totals.hours || '-'}</td>
                    <td className={`p-2 text-center font-bold ${textClass} bg-[hsl(var(--muted))]/30`}>{totals.daysWorked || '-'}</td>
                    <td className={`p-2 text-right ${textClass} bg-[hsl(var(--warning))]/10`}>{totals.advance > 0 ? totals.advance.toLocaleString() : '-'}</td>
                    <td className={`p-2 text-right font-medium text-green-600 bg-green-100/50 dark:bg-green-900/20`}>{totals.bonus > 0 ? `+${totals.bonus.toLocaleString()}` : '-'}</td>
                    <td className={`p-2 text-right font-medium text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10`}>{totals.penalty > 0 ? `-${totals.penalty.toLocaleString()}` : '-'}</td>
                    <td className={`p-2 text-right font-medium ${textClass} bg-[hsl(var(--primary))]/10`}>{totals.sumSalary > 0 ? totals.sumSalary.toLocaleString() : '-'}</td>
                    <td className={`p-2 text-right font-bold ${totals.netPay >= 0 ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--destructive))]'} bg-[hsl(var(--primary))]/20`}>{totals.netPay.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredEmployees.length > 0 && (
            <tfoot className="sticky bottom-0 bg-[hsl(var(--card))]">
              <tr className="border-t-2 border-[hsl(var(--border))] font-bold">
                <td colSpan={3} className={`p-2 text-right ${textClass} sticky left-0 bg-[hsl(var(--card))]`}>
                  Итого за {months[selectedMonth]}:
                </td>
                {days.map(day => {
                  const dayTotal = filteredEmployees.reduce((sum, e) => sum + (timesheetMap[e.id]?.[day] || 0), 0);
                  return (
                    <td key={day} className={`p-1 text-center ${isWeekend(day) ? 'bg-[hsl(var(--warning))]/10' : ''}`}>
                      <span className={dayTotal ? textClass : mutedClass}>{dayTotal || ''}</span>
                    </td>
                  );
                })}
                <td className={`p-2 text-center ${textClass} bg-[hsl(var(--primary))]/10 border-l border-[hsl(var(--border))]`}>{grandTotalHours}</td>
                <td className={`p-2 text-center ${textClass} bg-[hsl(var(--primary))]/10`}>{grandTotalDays}</td>
                <td className={`p-2 text-right ${textClass} bg-[hsl(var(--warning))]/10`}>{grandTotalAdvance.toLocaleString()}</td>
                <td className={`p-2 text-right text-green-600 bg-green-100/50 dark:bg-green-900/20`}>+{grandTotalBonus.toLocaleString()}</td>
                <td className={`p-2 text-right text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10`}>-{grandTotalPenalty.toLocaleString()}</td>
                <td className={`p-2 text-right ${textClass} bg-[hsl(var(--primary))]/10`}>{grandTotalSum.toLocaleString()}</td>
                <td className={`p-2 text-right text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/20`}>{grandTotalNet.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className={`text-sm ${mutedClass}`}>Кликните на ячейку чтобы добавить/изменить часы</p>
    </div>
  );
}

function CreateTimesheetModal({ branches, employees, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    employeeId: employees.length > 0 ? employees[0].id.toString() : '',
    branchId: branches.length > 0 ? branches[0].id.toString() : '',
    workDate: new Date().toISOString().split('T')[0],
    hoursWorked: '8',
    overtimeHours: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createTimesheet({
        employeeId: parseInt(form.employeeId),
        branchId: parseInt(form.branchId),
        workDate: form.workDate,
        hoursWorked: parseFloat(form.hoursWorked),
        overtimeHours: form.overtimeHours ? parseFloat(form.overtimeHours) : null,
        notes: form.notes || null
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Добавить запись в табель" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Сотрудник</label>
          <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className={inputClass} required>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Филиал</label>
          <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className={inputClass} required>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дата</label>
          <input type="date" value={form.workDate} onChange={e => setForm({ ...form, workDate: e.target.value })} className={inputClass} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Часы</label>
            <input type="number" step="0.5" min="0" max="24" value={form.hoursWorked} onChange={e => setForm({ ...form, hoursWorked: e.target.value })} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Сверхурочные</label>
            <input type="number" step="0.5" min="0" value={form.overtimeHours} onChange={e => setForm({ ...form, overtimeHours: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Примечание</label>
          <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={buttonSecondary}>Отмена</button>
          <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? 'Сохранение...' : 'Добавить'}</button>
        </div>
      </form>
    </Modal>
  );
}

function BonusesTab({ employees, selectedEmployee, selectedYear, selectedMonth, setError }) {
  const [bonuses, setBonuses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedEmployee, selectedYear, selectedMonth]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getBonuses(selectedEmployee || null, selectedYear, selectedMonth);
      setBonuses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить?')) return;
    try {
      await deleteBonus(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const totalBonus = bonuses.filter(b => b.bonusType === 'Bonus').reduce((sum, b) => sum + b.amount, 0);
  const totalPenalty = bonuses.filter(b => b.bonusType === 'Penalty').reduce((sum, b) => sum + b.amount, 0);

  if (loading) return <div className={mutedClass}>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className={`${cardClass} px-4 py-2`}>
            <span className={mutedClass}>Премии: </span>
            <span className="font-bold text-green-600">+{totalBonus.toLocaleString()} TJS</span>
          </div>
          <div className={`${cardClass} px-4 py-2`}>
            <span className={mutedClass}>Штрафы: </span>
            <span className="font-bold text-[hsl(var(--destructive))]">-{totalPenalty.toLocaleString()} TJS</span>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className={buttonPrimary + " flex items-center gap-2"}>
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className={`${cardClass} overflow-auto`}>
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Сотрудник</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Тип</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Сумма</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Причина</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.length === 0 ? (
              <tr><td colSpan={6} className={`p-8 text-center ${mutedClass}`}>Нет записей</td></tr>
            ) : (
              bonuses.map(b => (
                <tr key={b.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass}`}>{new Date(b.bonusDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass} font-medium`}>{b.employeeName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${b.bonusType === 'Bonus' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'}`}>
                      {b.bonusTypeName}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${b.bonusType === 'Bonus' ? 'text-green-600' : 'text-[hsl(var(--destructive))]'}`}>
                    {b.bonusType === 'Bonus' ? '+' : '-'}{b.amount.toLocaleString()} TJS
                  </td>
                  <td className={`p-3 ${mutedClass} max-w-xs truncate`}>{b.reason || '-'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg">
                      <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateBonusModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadData();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateBonusModal({ employees, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    employeeId: employees.length > 0 ? employees[0].id.toString() : '',
    bonusDate: new Date().toISOString().split('T')[0],
    bonusType: 'Bonus',
    amount: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createBonus({
        employeeId: parseInt(form.employeeId),
        bonusDate: form.bonusDate,
        bonusType: form.bonusType,
        amount: parseFloat(form.amount),
        reason: form.reason || null
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Добавить премию/штраф" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Сотрудник</label>
          <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className={inputClass} required>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дата</label>
          <input type="date" value={form.bonusDate} onChange={e => setForm({ ...form, bonusDate: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Тип</label>
          <select value={form.bonusType} onChange={e => setForm({ ...form, bonusType: e.target.value })} className={inputClass}>
            <option value="Bonus">Премия</option>
            <option value="Penalty">Штраф</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Сумма (TJS)</label>
          <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Причина</label>
          <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className={inputClass} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={buttonSecondary}>Отмена</button>
          <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? 'Сохранение...' : 'Добавить'}</button>
        </div>
      </form>
    </Modal>
  );
}

function AdvancesTab({ employees, selectedEmployee, selectedYear, selectedMonth, setError }) {
  const [advances, setAdvances] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedEmployee, selectedYear, selectedMonth]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAdvances(selectedEmployee || null, selectedYear, selectedMonth);
      setAdvances(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить?')) return;
    try {
      await deleteAdvance(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const total = advances.reduce((sum, a) => sum + a.amount, 0);

  if (loading) return <div className={mutedClass}>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className={`${cardClass} px-4 py-2`}>
          <span className={mutedClass}>Всего авансов: </span>
          <span className={`font-bold ${textClass}`}>{total.toLocaleString()} TJS</span>
        </div>
        <button onClick={() => setShowCreateModal(true)} className={buttonPrimary + " flex items-center gap-2"}>
          <Plus className="w-4 h-4" />
          Добавить аванс
        </button>
      </div>

      <div className={`${cardClass} overflow-auto`}>
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Сотрудник</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Сумма</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Примечание</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {advances.length === 0 ? (
              <tr><td colSpan={5} className={`p-8 text-center ${mutedClass}`}>Нет записей</td></tr>
            ) : (
              advances.map(a => (
                <tr key={a.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass}`}>{new Date(a.advanceDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass} font-medium`}>{a.employeeName}</td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{a.amount.toLocaleString()} TJS</td>
                  <td className={`p-3 ${mutedClass} max-w-xs truncate`}>{a.notes || '-'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg">
                      <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateAdvanceModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadData();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateAdvanceModal({ employees, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    employeeId: employees.length > 0 ? employees[0].id.toString() : '',
    advanceDate: new Date().toISOString().split('T')[0],
    amount: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAdvance({
        employeeId: parseInt(form.employeeId),
        advanceDate: form.advanceDate,
        amount: parseFloat(form.amount),
        notes: form.notes || null
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Добавить аванс" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Сотрудник</label>
          <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className={inputClass} required>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дата</label>
          <input type="date" value={form.advanceDate} onChange={e => setForm({ ...form, advanceDate: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Сумма (TJS)</label>
          <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Примечание</label>
          <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={buttonSecondary}>Отмена</button>
          <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? 'Сохранение...' : 'Добавить'}</button>
        </div>
      </form>
    </Modal>
  );
}

function RatesTab({ employees, selectedEmployee, setError }) {
  const [history, setHistory] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedEmployee) {
      loadData();
    } else {
      setHistory([]);
    }
  }, [selectedEmployee]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getEmployeeRateHistory(selectedEmployee);
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!selectedEmployee) {
    return (
      <div className={`${cardClass} p-8 text-center ${mutedClass}`}>
        Выберите сотрудника для просмотра истории ставок
      </div>
    );
  }

  if (loading) return <div className={mutedClass}>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowCreateModal(true)} className={buttonPrimary + " flex items-center gap-2"}>
          <Plus className="w-4 h-4" />
          Изменить ставку
        </button>
      </div>

      <div className={`${cardClass} overflow-auto`}>
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата начала</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Дневная ставка</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Месячный оклад</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Причина</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Установил</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={5} className={`p-8 text-center ${mutedClass}`}>Нет записей</td></tr>
            ) : (
              history.map(h => (
                <tr key={h.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass}`}>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{h.dailyRate ? `${h.dailyRate} TJS/день` : '-'}</td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{h.monthlyRate ? `${h.monthlyRate.toLocaleString()} TJS` : '-'}</td>
                  <td className={`p-3 ${mutedClass}`}>{h.reason || '-'}</td>
                  <td className={`p-3 ${mutedClass}`}>{h.setByUserLogin || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateRateModal
          employeeId={selectedEmployee}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadData();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateRateModal({ employeeId, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    effectiveDate: new Date().toISOString().split('T')[0],
    dailyRate: '',
    monthlyRate: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createEmployeeRateHistory({
        employeeId: parseInt(employeeId),
        effectiveDate: form.effectiveDate,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : null,
        monthlyRate: form.monthlyRate ? parseFloat(form.monthlyRate) : null,
        reason: form.reason || null
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Изменить ставку" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Дата начала действия</label>
          <input type="date" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дневная ставка (TJS/день)</label>
          <input type="number" step="0.01" min="0" value={form.dailyRate} onChange={e => setForm({ ...form, dailyRate: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Месячный оклад (TJS)</label>
          <input type="number" step="0.01" min="0" value={form.monthlyRate} onChange={e => setForm({ ...form, monthlyRate: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Причина изменения</label>
          <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className={inputClass} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={buttonSecondary}>Отмена</button>
          <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] ${wide ? 'w-full max-w-2xl max-h-[90vh] flex flex-col' : 'w-full max-w-md'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`p-4 ${wide ? 'flex-1 overflow-auto' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
