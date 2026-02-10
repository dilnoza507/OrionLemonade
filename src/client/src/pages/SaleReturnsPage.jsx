import { useState, useEffect } from 'react';
import { RotateCcw, Plus, Eye, Trash2, X, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { getSaleReturns, getSaleReturnDetail, createSaleReturn, deleteSaleReturn } from '../api/saleReturns';
import { getSales, getSaleDetail } from '../api/sales';
import { getBranches } from '../api/branches';
import { getClients } from '../api/clients';
import { getRecipes } from '../api/recipes';

const reasonLabels = {
  Defect: 'Брак',
  WrongProduct: 'Неверный товар',
  Expired: 'Истёк срок годности',
  Other: 'Другое'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function SaleReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReturns();
  }, [selectedBranch, selectedClient, dateFrom, dateTo]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [branchesData, clientsData] = await Promise.all([
        getBranches(),
        getClients()
      ]);
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setClients(clientsData.filter(c => c.status === 'Active'));
      await loadReturns();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadReturns() {
    try {
      const data = await getSaleReturns(
        selectedBranch || null,
        selectedClient || null,
        dateFrom || null,
        dateTo || null
      );
      setReturns(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить возврат? Это действие нельзя отменить.')) return;
    try {
      await deleteSaleReturn(id);
      await loadReturns();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(id) {
    try {
      const detail = await getSaleReturnDetail(id);
      setSelectedReturn(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalReturns = returns.length;
  const totalItems = returns.reduce((acc, r) => acc + r.totalQuantity, 0);

  if (loading) {
    return <div className="p-6 text-[hsl(var(--muted-foreground))]">Загрузка...</div>;
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Всего возвратов</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalReturns}</p>
            </div>
            <RotateCcw className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Возвращено единиц</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-[hsl(var(--warning))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>За сегодня</p>
              <p className={`text-2xl font-bold ${textClass}`}>
                {returns.filter(r => new Date(r.returnDate).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-[hsl(var(--destructive))]" />
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
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          >
            <option value="">Все клиенты</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--primary))]/90"
        >
          <Plus className="w-4 h-4" />
          Новый возврат
        </button>
      </div>

      {/* Returns Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Номер</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Клиент</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Продажа</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Причина</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Кол-во</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td colSpan={8} className={`p-8 text-center ${mutedClass}`}>
                  Нет возвратов
                </td>
              </tr>
            ) : (
              returns.map(ret => (
                <tr key={ret.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass} font-mono`}>{ret.returnNumber}</td>
                  <td className={`p-3 ${textClass}`}>{new Date(ret.returnDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass}`}>{ret.branchName}</td>
                  <td className={`p-3 ${textClass}`}>{ret.clientName}</td>
                  <td className={`p-3 ${mutedClass} font-mono text-sm`}>{ret.saleNumber}</td>
                  <td className={`p-3`}>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ret.reasonName === 'Брак' ? 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]' :
                      ret.reasonName === 'Истёк срок годности' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]' :
                      'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {ret.reasonName}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{ret.totalQuantity}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetail(ret.id)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Детали"
                      >
                        <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                      <button
                        onClick={() => handleDelete(ret.id)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                      </button>
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
        <CreateReturnModal
          branches={branches}
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadReturns();
          }}
          setError={setError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReturn && (
        <ReturnDetailModal
          returnData={selectedReturn}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReturn(null);
          }}
        />
      )}
    </div>
  );
}

function CreateReturnModal({ branches, clients, onClose, onSave, setError }) {
  const [step, setStep] = useState(1);
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetail, setSaleDetail] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);

  const [form, setForm] = useState({
    branchId: branches.length > 0 ? branches[0].id.toString() : '',
    returnDate: new Date().toISOString().split('T')[0],
    reason: 'Defect',
    comment: '',
    items: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.branchId) {
      loadSales();
    }
  }, [form.branchId]);

  async function loadSales() {
    setLoadingSales(true);
    try {
      const data = await getSales(parseInt(form.branchId));
      // Filter only shipped or paid sales
      const eligibleSales = data.filter(s =>
        ['Отгружено', 'Оплачено', 'Частично оплачено'].includes(s.statusName)
      );
      setSales(eligibleSales);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSales(false);
    }
  }

  async function handleSelectSale(sale) {
    try {
      const detail = await getSaleDetail(sale.id);
      setSelectedSale(sale);
      setSaleDetail(detail);
      setForm(f => ({
        ...f,
        items: detail.items.map(item => ({
          recipeId: item.recipeId,
          productName: item.productName,
          maxQuantity: item.quantity,
          quantity: 0,
          returnToStock: true
        }))
      }));
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateItemQuantity(index, quantity) {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) =>
        i === index ? { ...item, quantity: Math.min(Math.max(0, quantity), item.maxQuantity) } : item
      )
    }));
  }

  function updateItemReturnToStock(index, returnToStock) {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) =>
        i === index ? { ...item, returnToStock } : item
      )
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const itemsToReturn = form.items.filter(i => i.quantity > 0);
    if (itemsToReturn.length === 0) {
      setError('Выберите хотя бы один товар для возврата');
      return;
    }

    setSaving(true);
    try {
      await createSaleReturn({
        branchId: parseInt(form.branchId),
        returnDate: new Date(form.returnDate).toISOString(),
        saleId: selectedSale.id,
        clientId: selectedSale.clientId,
        reason: form.reason,
        comment: form.comment || null,
        items: itemsToReturn.map(i => ({
          recipeId: i.recipeId,
          quantity: i.quantity,
          returnToStock: i.returnToStock
        }))
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
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-2xl max-h-[90vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            {step === 1 ? 'Выберите продажу' : 'Оформление возврата'}
          </h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
              <select
                value={form.branchId}
                onChange={e => setForm({ ...form, branchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {loadingSales ? (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-8">Загрузка продаж...</p>
            ) : sales.length === 0 ? (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-8">Нет продаж для возврата</p>
            ) : (
              <div className="space-y-2">
                {sales.map(sale => (
                  <div
                    key={sale.id}
                    onClick={() => handleSelectSale(sale)}
                    className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm text-[hsl(var(--foreground))]">{sale.saleNumber}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{sale.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[hsl(var(--foreground))]">{new Date(sale.saleDate).toLocaleDateString()}</p>
                        <p className="text-sm font-medium text-[hsl(var(--primary))]">{sale.totalTjs.toLocaleString()} TJS</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Продажа</p>
              <p className="font-mono text-[hsl(var(--foreground))]">{selectedSale.saleNumber}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{selectedSale.clientName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата возврата</label>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={e => setForm({ ...form, returnDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Причина</label>
                <select
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                >
                  <option value="Defect">Брак</option>
                  <option value="WrongProduct">Неверный товар</option>
                  <option value="Expired">Истёк срок годности</option>
                  <option value="Other">Другое</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Товары для возврата</label>
              <div className="space-y-2">
                {form.items.map((item, index) => (
                  <div key={index} className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-[hsl(var(--foreground))]">{item.productName}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Куплено: {item.maxQuantity} шт.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={e => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-center"
                          />
                          <span className="text-sm text-[hsl(var(--muted-foreground))]">шт.</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.returnToStock}
                            onChange={e => updateItemReturnToStock(index, e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-[hsl(var(--foreground))]">На склад</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Комментарий</label>
              <textarea
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                rows={2}
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              >
                Назад
              </button>
              <div className="flex gap-2">
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
                  {saving ? 'Создание...' : 'Создать возврат'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ReturnDetailModal({ returnData, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Возврат {returnData.returnNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата</p>
              <p className="text-[hsl(var(--foreground))]">{new Date(returnData.returnDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Филиал</p>
              <p className="text-[hsl(var(--foreground))]">{returnData.branchName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Клиент</p>
              <p className="text-[hsl(var(--foreground))]">{returnData.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Продажа</p>
              <p className="font-mono text-[hsl(var(--foreground))]">{returnData.saleNumber}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Причина</p>
              <p className="text-[hsl(var(--foreground))]">{returnData.reasonName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Создал</p>
              <p className="text-[hsl(var(--foreground))]">{returnData.createdByUserLogin || '-'}</p>
            </div>
          </div>

          {returnData.comment && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Комментарий</p>
              <p className="text-[hsl(var(--foreground))]">{returnData.comment}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Позиции возврата</p>
            <div className="space-y-2">
              {returnData.items?.map(item => (
                <div key={item.id} className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))]">{item.productName}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.quantity} шт.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.returnToStock ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded text-xs">
                        <CheckCircle className="w-3 h-3" />
                        На складе
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Списано
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
