import { useState, useEffect } from 'react';
import { Wallet, Plus, Edit2, Trash2, X, Tag, DollarSign, TrendingUp, Calendar, RotateCcw } from 'lucide-react';
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory,
  getExpensesSummary
} from '../api/expenses';
import { getBranches } from '../api/branches';
import { getExchangeRate } from '../api/exchangeRates';

const currencyLabels = { TJS: 'TJS', USD: 'USD' };
const sourceLabels = { Manual: 'Вручную', AutoReceipt: 'Авто (поступление)', AutoPayroll: 'Авто (зарплата)' };
const recurrenceLabels = { Monthly: 'Ежемесячно', Weekly: 'Еженедельно' };

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [selectedBranch, selectedCategory, dateFrom, dateTo]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [branchesData, categoriesData, summaryData] = await Promise.all([
        getBranches(),
        getExpenseCategories(),
        getExpensesSummary()
      ]);
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setCategories(categoriesData);
      setSummary(summaryData);
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadExpenses() {
    try {
      const data = await getExpenses(
        selectedBranch || null,
        selectedCategory || null,
        dateFrom || null,
        dateTo || null
      );
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить расход?')) return;
    try {
      await deleteExpense(id);
      await loadExpenses();
      const summaryData = await getExpensesSummary();
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(expense) {
    setSelectedExpense(expense);
    setShowEditModal(true);
  }

  const totalExpensesTjs = summary.reduce((acc, s) => acc + s.totalAmountTjs, 0);
  const totalCount = summary.reduce((acc, s) => acc + s.totalCount, 0);

  if (loading) {
    return <div className="p-6 text-[hsl(var(--muted-foreground))]">Загрузка...</div>;
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Всего расходов</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalCount}</p>
            </div>
            <Wallet className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Сумма (TJS)</p>
              <p className="text-2xl font-bold text-[hsl(var(--destructive))]">{totalExpensesTjs.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[hsl(var(--destructive))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Категорий</p>
              <p className={`text-2xl font-bold ${textClass}`}>{categories.length}</p>
            </div>
            <Tag className="w-8 h-8 text-[hsl(var(--warning))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Топ категория</p>
              <p className="text-lg font-bold text-[hsl(var(--primary))] truncate">
                {summary.length > 0 && summary[0].byCategory?.length > 0 ? summary[0].byCategory[0].categoryName : '-'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-xl p-4 text-[hsl(var(--destructive))]">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Закрыть</button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          >
            <option value="">Все филиалы</option>
            <option value="0">Общие расходы</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          >
            <option value="">Все категории</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
            placeholder="С"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
            placeholder="По"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--secondary))]/90"
          >
            <Tag className="w-4 h-4" />
            Категории
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--primary))]/90"
          >
            <Plus className="w-4 h-4" />
            Новый расход
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Категория</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Сумма</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Курс</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Сумма (TJS)</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Комментарий</th>
              <th className={`text-center p-3 ${mutedClass} font-medium`}>Повтор</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Источник</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={10} className={`p-8 text-center ${mutedClass}`}>
                  Нет расходов
                </td>
              </tr>
            ) : (
              expenses.map(expense => (
                <tr key={expense.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass}`}>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass}`}>{expense.branchName || 'Общие'}</td>
                  <td className={`p-3 ${textClass}`}>
                    <span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-sm">
                      {expense.categoryName}
                    </span>
                  </td>
                  <td className={`p-3 text-right ${textClass} font-mono`}>
                    {expense.amountOriginal.toLocaleString()} {currencyLabels[expense.currencyName] || expense.currencyName}
                  </td>
                  <td className={`p-3 text-right ${mutedClass} font-mono text-sm`}>
                    {expense.currencyName === 'USD' ? expense.exchangeRate.toFixed(2) : '-'}
                  </td>
                  <td className={`p-3 text-right font-medium text-[hsl(var(--destructive))]`}>
                    {expense.amountTjs.toLocaleString()}
                  </td>
                  <td className={`p-3 ${mutedClass} max-w-[200px] truncate`} title={expense.comment}>
                    {expense.comment || '-'}
                  </td>
                  <td className="p-3 text-center">
                    {expense.isRecurring ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded text-xs">
                        <RotateCcw className="w-3 h-3" />
                        {recurrenceLabels[expense.recurrencePeriodName] || expense.recurrencePeriodName}
                      </span>
                    ) : '-'}
                  </td>
                  <td className={`p-3 ${mutedClass} text-sm`}>
                    {sourceLabels[expense.sourceName] || expense.sourceName}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      {expense.sourceName === 'Manual' && (
                        <>
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Edit2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                          </button>
                        </>
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
        <CreateExpenseModal
          branches={branches}
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadExpenses();
            const summaryData = await getExpensesSummary();
            setSummary(summaryData);
          }}
          setError={setError}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          branches={branches}
          categories={categories}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
          onSave={async () => {
            setShowEditModal(false);
            setSelectedExpense(null);
            await loadExpenses();
            const summaryData = await getExpensesSummary();
            setSummary(summaryData);
          }}
          setError={setError}
        />
      )}

      {/* Categories Modal */}
      {showCategoriesModal && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCategoriesModal(false)}
          onRefresh={async () => {
            const categoriesData = await getExpenseCategories();
            setCategories(categoriesData);
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateExpenseModal({ branches, categories, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    branchId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: categories.length > 0 ? categories[0].id.toString() : '',
    currency: 'TJS',
    amountOriginal: '',
    exchangeRate: '',
    comment: '',
    isRecurring: false,
    recurrencePeriod: 'Monthly'
  });
  const [saving, setSaving] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    loadCurrentRate();
  }, []);

  async function loadCurrentRate() {
    try {
      const rates = await getExchangeRate();
      if (rates && rates.length > 0) {
        setCurrentRate(rates[0].rate);
        setForm(f => ({ ...f, exchangeRate: rates[0].rate.toString() }));
      }
    } catch {
      // ignore
    }
  }

  const calculatedTjs = form.currency === 'USD' && form.amountOriginal && form.exchangeRate
    ? (parseFloat(form.amountOriginal) * parseFloat(form.exchangeRate)).toFixed(2)
    : form.amountOriginal || '0';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.categoryId || !form.amountOriginal) {
      setError('Заполните все обязательные поля');
      return;
    }

    setSaving(true);
    try {
      await createExpense({
        branchId: form.branchId ? parseInt(form.branchId) : null,
        expenseDate: new Date(form.expenseDate).toISOString(),
        categoryId: parseInt(form.categoryId),
        currency: form.currency,
        amountOriginal: parseFloat(form.amountOriginal),
        exchangeRate: form.currency === 'USD' && form.exchangeRate ? parseFloat(form.exchangeRate) : null,
        comment: form.comment || null,
        isRecurring: form.isRecurring,
        recurrencePeriod: form.isRecurring ? form.recurrencePeriod : null
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Новый расход</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
              <select
                value={form.branchId}
                onChange={e => setForm({ ...form, branchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="">Общие расходы</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата *</label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Категория *</label>
            <select
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Валюта</label>
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="TJS">TJS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Сумма *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amountOriginal}
                onChange={e => setForm({ ...form, amountOriginal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              />
            </div>
            {form.currency === 'USD' && (
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Курс</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.exchangeRate}
                  onChange={e => setForm({ ...form, exchangeRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  placeholder={currentRate ? currentRate.toString() : ''}
                />
              </div>
            )}
          </div>

          {form.currency === 'USD' && (
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Сумма в TJS:</p>
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">{parseFloat(calculatedTjs).toLocaleString()} TJS</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Комментарий</label>
            <textarea
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={e => setForm({ ...form, isRecurring: e.target.checked })}
                className="w-4 h-4 rounded border-[hsl(var(--border))]"
              />
              <span className="text-sm text-[hsl(var(--foreground))]">Повторяющийся расход</span>
            </label>
            {form.isRecurring && (
              <select
                value={form.recurrencePeriod}
                onChange={e => setForm({ ...form, recurrencePeriod: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
              >
                <option value="Monthly">Ежемесячно</option>
                <option value="Weekly">Еженедельно</option>
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50"
            >
              {saving ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditExpenseModal({ expense, branches, categories, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    branchId: expense.branchId?.toString() || '',
    expenseDate: expense.expenseDate.split('T')[0],
    categoryId: expense.categoryId.toString(),
    currency: expense.currencyName,
    amountOriginal: expense.amountOriginal.toString(),
    exchangeRate: expense.exchangeRate.toString(),
    comment: expense.comment || '',
    isRecurring: expense.isRecurring,
    recurrencePeriod: expense.recurrencePeriodName || 'Monthly'
  });
  const [saving, setSaving] = useState(false);

  const calculatedTjs = form.currency === 'USD' && form.amountOriginal && form.exchangeRate
    ? (parseFloat(form.amountOriginal) * parseFloat(form.exchangeRate)).toFixed(2)
    : form.amountOriginal || '0';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.categoryId || !form.amountOriginal) return;

    setSaving(true);
    try {
      await updateExpense(expense.id, {
        branchId: form.branchId ? parseInt(form.branchId) : null,
        expenseDate: new Date(form.expenseDate).toISOString(),
        categoryId: parseInt(form.categoryId),
        currency: form.currency,
        amountOriginal: parseFloat(form.amountOriginal),
        exchangeRate: form.currency === 'USD' && form.exchangeRate ? parseFloat(form.exchangeRate) : null,
        comment: form.comment || null,
        isRecurring: form.isRecurring,
        recurrencePeriod: form.isRecurring ? form.recurrencePeriod : null
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Редактировать расход</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
              <select
                value={form.branchId}
                onChange={e => setForm({ ...form, branchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="">Общие расходы</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата *</label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Категория *</label>
            <select
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Валюта</label>
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="TJS">TJS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Сумма *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amountOriginal}
                onChange={e => setForm({ ...form, amountOriginal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              />
            </div>
            {form.currency === 'USD' && (
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Курс</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.exchangeRate}
                  onChange={e => setForm({ ...form, exchangeRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
              </div>
            )}
          </div>

          {form.currency === 'USD' && (
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Сумма в TJS:</p>
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">{parseFloat(calculatedTjs).toLocaleString()} TJS</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Комментарий</label>
            <textarea
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={e => setForm({ ...form, isRecurring: e.target.checked })}
                className="w-4 h-4 rounded border-[hsl(var(--border))]"
              />
              <span className="text-sm text-[hsl(var(--foreground))]">Повторяющийся расход</span>
            </label>
            {form.isRecurring && (
              <select
                value={form.recurrencePeriod}
                onChange={e => setForm({ ...form, recurrencePeriod: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
              >
                <option value="Monthly">Ежемесячно</option>
                <option value="Weekly">Еженедельно</option>
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoriesModal({ categories, onClose, onRefresh, setError }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setSaving(true);
    try {
      await createExpenseCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || null
      });
      setNewCategory({ name: '', description: '' });
      setShowAddForm(false);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id) {
    if (!editForm.name.trim()) return;

    setSaving(true);
    try {
      await updateExpenseCategory(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null
      });
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить категорию? Это возможно только если нет связанных расходов.')) return;
    try {
      await deleteExpenseCategory(id);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setEditForm({ name: category.name, description: category.description || '' });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg max-h-[80vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Категории расходов</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* Add form */}
          {showAddForm ? (
            <form onSubmit={handleCreate} className="mb-4 p-3 bg-[hsl(var(--muted))]/30 rounded-lg space-y-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Название категории"
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              />
              <input
                type="text"
                value={newCategory.description}
                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Описание (необязательно)"
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm"
                >
                  {saving ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-[hsl(var(--border))] rounded-lg text-sm"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 px-4 py-2 border-2 border-dashed border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить категорию
            </button>
          )}

          {/* Categories list */}
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
                {editingId === category.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Описание"
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(category.id)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded text-sm"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-[hsl(var(--border))] rounded text-sm"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {category.name}
                        {category.isSystem && (
                          <span className="ml-2 px-2 py-0.5 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs rounded">
                            Системная
                          </span>
                        )}
                      </p>
                      {category.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{category.description}</p>
                      )}
                    </div>
                    {!category.isSystem && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[hsl(var(--border))]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
