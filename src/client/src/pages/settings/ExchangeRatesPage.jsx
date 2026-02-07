import { useState, useEffect } from 'react';
import { DollarSign, Plus, Pencil, Trash2, X, TrendingUp, Calendar } from 'lucide-react';
import { getExchangeRates, createExchangeRate, updateExchangeRate, deleteExchangeRate } from '../../api/exchangeRates';

const CURRENCY_PAIRS = {
  UsdTjs: 'USD/TJS',
};

const SOURCES = {
  Manual: 'Вручную',
  Nbt: 'НБТ',
};

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);

  useEffect(() => { loadRates(); }, []);

  async function loadRates() {
    try {
      setLoading(true);
      const data = await getExchangeRates();
      setRates(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить курсы валют');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingRate(null); setIsModalOpen(true); }
  function handleEdit(rate) { setEditingRate(rate); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить курс?')) return;
    try { await deleteExchangeRate(id); await loadRates(); }
    catch (err) { setError('Не удалось удалить курс'); }
  }

  async function handleSave(data) {
    try {
      if (editingRate) { await updateExchangeRate(editingRate.id, data); }
      else { await createExchangeRate(data); }
      setIsModalOpen(false);
      await loadRates();
    } catch (err) { setError('Не удалось сохранить курс'); }
  }

  const latestRate = rates.length > 0 ? rates[0] : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Курсы валют</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Управление курсами обмена валют</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить
        </button>
      </div>

      {latestRate && (
        <div className="bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/5 rounded-xl border border-[hsl(var(--primary))]/20 p-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Текущий курс USD/TJS</p>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{latestRate.rate.toFixed(4)}</p>
            </div>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Дата: {latestRate.rateDate} | Источник: {SOURCES[latestRate.source] || latestRate.source}
          </p>
        </div>
      )}

      {error && (<div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">{error}</div>)}

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[hsl(var(--muted-foreground))]">Загрузка...</div></div>
      ) : rates.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><DollarSign className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет курсов валют</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первый курс</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить курс
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Дата</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Валютная пара</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Курс</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Источник</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Установил</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, index) => (
                <tr key={rate.id} className={index !== rates.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <span className="text-sm text-[hsl(var(--foreground))]">{rate.rateDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">{CURRENCY_PAIRS[rate.currencyPair] || rate.currencyPair}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{rate.rate.toFixed(4)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${rate.source === 'Manual' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]' : 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'}`}>
                      {SOURCES[rate.source] || rate.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{rate.setByUserLogin || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(rate)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(rate.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (<RateModal rate={editingRate} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function RateModal({ rate, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    rateDate: rate?.rateDate || today,
    currencyPair: rate?.currencyPair || 'UsdTjs',
    rate: rate?.rate || '',
    source: rate?.source || 'Manual',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...formData,
      rate: parseFloat(formData.rate),
    });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{rate ? 'Редактировать курс' : 'Новый курс'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата курса *</label>
            <input type="date" required value={formData.rateDate} onChange={(e) => setFormData({ ...formData, rateDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Валютная пара *</label>
            <select value={formData.currencyPair} onChange={(e) => setFormData({ ...formData, currencyPair: e.target.value })} className={inputClass}>
              {Object.entries(CURRENCY_PAIRS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Курс *</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              required
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className={inputClass}
              placeholder="10.8500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Источник *</label>
            <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className={inputClass}>
              {Object.entries(SOURCES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{rate ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
