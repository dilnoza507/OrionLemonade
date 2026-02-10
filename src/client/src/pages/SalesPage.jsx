import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, X, Eye, CheckCircle, Truck, Ban, CreditCard, DollarSign, Clock, Package, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSales, createSale, updateSale, deleteSale, getSaleDetail, confirmSale, shipSale, cancelSale, addPayment, deletePayment, getSalesSummary } from '../api/sales';
import { getRecipes } from '../api/recipes';
import { getBranches } from '../api/branches';
import { getClients } from '../api/clients';
import { getPriceLists, getPriceListDetail } from '../api/priceLists';

const statusLabels = {
  Draft: 'Черновик',
  Confirmed: 'Подтверждён',
  Shipped: 'Отгружен',
  Paid: 'Оплачен',
  PartiallyPaid: 'Частично оплачен',
  Cancelled: 'Отменён'
};

const statusColors = {
  Draft: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  Confirmed: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  Shipped: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  Paid: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
  PartiallyPaid: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  Cancelled: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
};

const paymentStatusLabels = { Unpaid: 'Не оплачен', Partial: 'Частично', Paid: 'Оплачен' };
const paymentStatusColors = {
  Unpaid: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]',
  Partial: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  Paid: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
};

const paymentMethodLabels = { Cash: 'Наличные', BankTransfer: 'Перевод' };

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function SalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSales();
  }, [selectedBranch, selectedClient, dateFrom, dateTo]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [branchesData, clientsData, recipesData, summaryData, priceListsData] = await Promise.all([
        getBranches(),
        getClients(),
        getRecipes(),
        getSalesSummary(),
        getPriceLists(null, true) // only active price lists
      ]);
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setClients(clientsData.filter(c => c.status === 'Active'));
      setRecipes(recipesData.filter(r => r.status === 'Active'));
      setSummary(summaryData);
      setPriceLists(priceListsData);
      await loadSales();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSales() {
    try {
      const data = await getSales(
        selectedBranch || null,
        selectedClient || null,
        dateFrom || null,
        dateTo || null
      );
      setSales(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить продажу?')) return;
    try {
      await deleteSale(id);
      await loadSales();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(sale) {
    try {
      const detail = await getSaleDetail(sale.id);
      setSelectedSale(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(sale) {
    setSelectedSale(sale);
    setShowEditModal(true);
  }

  const totalSales = summary.reduce((acc, s) => acc + s.totalSales, 0);
  const totalRevenue = summary.reduce((acc, s) => acc + s.totalRevenueTjs, 0);
  const totalDebt = summary.reduce((acc, s) => acc + s.totalDebtTjs, 0);
  const totalPaid = summary.reduce((acc, s) => acc + s.totalPaidTjs, 0);

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
              <p className={`${mutedClass} text-sm`}>Всего продаж</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalSales}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Выручка (TJS)</p>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Оплачено (TJS)</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">{totalPaid.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Задолженность (TJS)</p>
              <p className="text-2xl font-bold text-[hsl(var(--warning))]">{totalDebt.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-[hsl(var(--warning))]" />
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
            onClick={() => navigate('/price-lists')}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--secondary))]/90"
          >
            <FileText className="w-4 h-4" />
            Прайс-листы
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--primary))]/90"
          >
            <Plus className="w-4 h-4" />
            Новая продажа
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Номер</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Клиент</th>
              <th className={`text-center p-3 ${mutedClass} font-medium`}>Статус</th>
              <th className={`text-center p-3 ${mutedClass} font-medium`}>Оплата</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Сумма (TJS)</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Долг (TJS)</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={9} className={`p-8 text-center ${mutedClass}`}>
                  Нет продаж
                </td>
              </tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass} font-mono`}>{sale.saleNumber}</td>
                  <td className={`p-3 ${textClass}`}>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass}`}>{sale.branchName}</td>
                  <td className={`p-3 ${textClass}`}>{sale.clientName}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sale.statusName] || ''}`}>
                      {statusLabels[sale.statusName] || sale.statusName}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[sale.paymentStatusName] || ''}`}>
                      {paymentStatusLabels[sale.paymentStatusName] || sale.paymentStatusName}
                    </span>
                  </td>
                  <td className={`p-3 text-right ${textClass} font-medium`}>{sale.totalTjs.toLocaleString()}</td>
                  <td className={`p-3 text-right ${sale.debtTjs > 0 ? 'text-[hsl(var(--warning))]' : textClass}`}>
                    {sale.debtTjs.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetail(sale)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4 text-[hsl(var(--primary))]" />
                      </button>
                      {sale.statusName === 'Черновик' && (
                        <>
                          <button
                            onClick={() => handleEdit(sale)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Edit2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
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
        <CreateSaleModal
          branches={branches}
          clients={clients}
          recipes={recipes}
          priceLists={priceLists}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadSales();
            const summaryData = await getSalesSummary();
            setSummary(summaryData);
          }}
          setError={setError}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSale && (
        <EditSaleModal
          sale={selectedSale}
          clients={clients}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSale(null);
          }}
          onSave={async () => {
            setShowEditModal(false);
            setSelectedSale(null);
            await loadSales();
          }}
          setError={setError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSale(null);
          }}
          onRefresh={async () => {
            const detail = await getSaleDetail(selectedSale.id);
            setSelectedSale(detail);
            await loadSales();
            const summaryData = await getSalesSummary();
            setSummary(summaryData);
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateSaleModal({ branches, clients, recipes, priceLists, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    branchId: branches.length > 0 ? branches[0].id.toString() : '',
    saleDate: new Date().toISOString().split('T')[0],
    clientId: '',
    priceListId: '',
    paymentMethod: 'Cash',
    paymentDueDate: '',
    notes: ''
  });
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [priceListItems, setPriceListItems] = useState([]);

  // Filter price lists by selected branch
  const filteredPriceLists = priceLists.filter(pl =>
    !pl.branchId || pl.branchId.toString() === form.branchId
  );

  // Load price list items when price list changes
  useEffect(() => {
    if (form.priceListId) {
      getPriceListDetail(form.priceListId)
        .then(data => setPriceListItems(data.items || []))
        .catch(() => setPriceListItems([]));
    } else {
      setPriceListItems([]);
    }
  }, [form.priceListId]);

  function addItem() {
    setItems([...items, { recipeId: '', quantity: '1', unitPriceTjs: '' }]);
  }

  function updateItem(index, field, value) {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-fill price when recipe is selected
    if (field === 'recipeId' && value && priceListItems.length > 0) {
      const priceItem = priceListItems.find(pi => pi.recipeId.toString() === value);
      if (priceItem) {
        newItems[index].unitPriceTjs = priceItem.priceTjs.toString();
      }
    }

    setItems(newItems);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((acc, item) => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.unitPriceTjs) || 0;
    return acc + qty * price;
  }, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.branchId || !form.clientId || items.length === 0) {
      setError('Заполните все обязательные поля и добавьте позиции');
      return;
    }

    const invalidItems = items.filter(i => !i.recipeId || !i.quantity || !i.unitPriceTjs);
    if (invalidItems.length > 0) {
      setError('Заполните все поля позиций');
      return;
    }

    setSaving(true);
    try {
      await createSale({
        branchId: parseInt(form.branchId),
        saleDate: new Date(form.saleDate).toISOString(),
        clientId: parseInt(form.clientId),
        paymentMethod: form.paymentMethod,
        paymentDueDate: form.paymentDueDate ? new Date(form.paymentDueDate).toISOString() : null,
        notes: form.notes || null,
        items: items.map(i => ({
          recipeId: parseInt(i.recipeId),
          quantity: parseInt(i.quantity),
          unitPriceTjs: parseFloat(i.unitPriceTjs)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-6">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-3xl border border-[hsl(var(--border))] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Новая продажа</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал *</label>
              <select
                value={form.branchId}
                onChange={e => setForm({ ...form, branchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              >
                <option value="">Выберите филиал</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата продажи *</label>
              <input
                type="date"
                value={form.saleDate}
                onChange={e => setForm({ ...form, saleDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Клиент *</label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              >
                <option value="">Выберите клиента</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Прайс-лист</label>
              <select
                value={form.priceListId}
                onChange={e => setForm({ ...form, priceListId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="">Без прайс-листа</option>
                {filteredPriceLists.map(pl => (
                  <option key={pl.id} value={pl.id}>{pl.name} {pl.branchName ? `(${pl.branchName})` : '(Общий)'}</option>
                ))}
              </select>
              {form.priceListId && priceListItems.length > 0 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {priceListItems.length} позиций в прайсе
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Способ оплаты</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="Cash">Наличные</option>
                <option value="BankTransfer">Перевод</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Срок оплаты</label>
              <input
                type="date"
                value={form.paymentDueDate}
                onChange={e => setForm({ ...form, paymentDueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Примечание</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              rows={2}
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Позиции *</label>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center p-2 bg-[hsl(var(--muted))]/30 rounded-lg">
                  <select
                    value={item.recipeId}
                    onChange={e => updateItem(index, 'recipeId', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
                    required
                  >
                    <option value="">Выберите продукт</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.productName}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Кол-во"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                    className="w-20 px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Цена TJS"
                    value={item.unitPriceTjs}
                    onChange={e => updateItem(index, 'unitPriceTjs', e.target.value)}
                    className="w-28 px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
                    required
                  />
                  <div className="w-24 text-right text-sm font-medium text-[hsl(var(--foreground))]">
                    {((parseInt(item.quantity) || 0) * (parseFloat(item.unitPriceTjs) || 0)).toLocaleString()} TJS
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-[hsl(var(--muted-foreground))] py-4">Добавьте позиции</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[hsl(var(--border))]">
            <div className="text-lg font-bold text-[hsl(var(--foreground))]">
              Итого: {total.toLocaleString()} TJS
            </div>
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
                {saving ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditSaleModal({ sale, clients, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    saleDate: sale.saleDate.split('T')[0],
    clientId: sale.clientId.toString(),
    paymentMethod: sale.paymentMethodName,
    paymentDueDate: sale.paymentDueDate ? sale.paymentDueDate.split('T')[0] : '',
    notes: sale.notes || ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientId) return;

    setSaving(true);
    try {
      await updateSale(sale.id, {
        saleDate: new Date(form.saleDate).toISOString(),
        clientId: parseInt(form.clientId),
        paymentMethod: form.paymentMethod,
        paymentDueDate: form.paymentDueDate ? new Date(form.paymentDueDate).toISOString() : null,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-md border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Редактировать продажу</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата продажи *</label>
            <input
              type="date"
              value={form.saleDate}
              onChange={e => setForm({ ...form, saleDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Клиент *</label>
            <select
              value={form.clientId}
              onChange={e => setForm({ ...form, clientId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Способ оплаты</label>
            <select
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            >
              <option value="Cash">Наличные</option>
              <option value="BankTransfer">Перевод</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Срок оплаты</label>
            <input
              type="date"
              value={form.paymentDueDate}
              onChange={e => setForm({ ...form, paymentDueDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Примечание</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              rows={2}
            />
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

function SaleDetailModal({ sale, onClose, onRefresh, setError }) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ paymentDate: new Date().toISOString().split('T')[0], amountTjs: '', method: 'Cash', notes: '' });
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!confirm('Подтвердить продажу?')) return;
    try {
      await confirmSale(sale.id);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleShip() {
    if (!confirm('Отгрузить продажу? Продукция будет списана со склада.')) return;
    try {
      await shipSale(sale.id);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel() {
    if (!confirm('Отменить продажу?')) return;
    try {
      await cancelSale(sale.id);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddPayment(e) {
    e.preventDefault();
    if (!newPayment.amountTjs) return;

    setSaving(true);
    try {
      await addPayment(sale.id, {
        paymentDate: new Date(newPayment.paymentDate).toISOString(),
        amountTjs: parseFloat(newPayment.amountTjs),
        method: newPayment.method,
        notes: newPayment.notes || null
      });
      setNewPayment({ paymentDate: new Date().toISOString().split('T')[0], amountTjs: '', method: 'Cash', notes: '' });
      setShowAddPayment(false);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePayment(paymentId) {
    if (!confirm('Удалить платёж?')) return;
    try {
      await deletePayment(paymentId);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const canConfirm = sale.statusName === 'Черновик';
  const canShip = sale.statusName === 'Подтверждено';
  const canCancel = ['Черновик', 'Подтверждено'].includes(sale.statusName);
  const canAddPayment = ['Подтверждено', 'Отгружено', 'Частично оплачено'].includes(sale.statusName);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-6">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-4xl max-h-[90vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{sale.saleNumber}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {sale.branchName} | {sale.clientName} | {new Date(sale.saleDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[sale.statusName] || ''}`}>
              {statusLabels[sale.statusName] || sale.statusName}
            </span>
            <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {canConfirm && (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Подтвердить
              </button>
            )}
            {canShip && (
              <button
                onClick={handleShip}
                className="px-4 py-2 bg-[hsl(var(--warning))] text-white rounded-lg flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Отгрузить
              </button>
            )}
            {canAddPayment && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="px-4 py-2 bg-[hsl(var(--success))] text-white rounded-lg flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Добавить оплату
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-[hsl(var(--destructive))] text-white rounded-lg flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Отменить
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Сумма</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">{sale.totalTjs.toLocaleString()} TJS</p>
            </div>
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Оплачено</p>
              <p className="text-xl font-bold text-[hsl(var(--success))]">{sale.paidTjs.toLocaleString()} TJS</p>
            </div>
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Долг</p>
              <p className="text-xl font-bold text-[hsl(var(--warning))]">{sale.debtTjs.toLocaleString()} TJS</p>
            </div>
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Способ оплаты</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">{paymentMethodLabels[sale.paymentMethodName] || sale.paymentMethodName}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Позиции ({sale.items.length})
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="text-left p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Продукт</th>
                  <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Кол-во</th>
                  <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Цена (TJS)</th>
                  <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Сумма (TJS)</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map(item => (
                  <tr key={item.id} className="border-b border-[hsl(var(--border))] last:border-0">
                    <td className="p-2 text-[hsl(var(--foreground))]">{item.productName}</td>
                    <td className="p-2 text-right text-[hsl(var(--foreground))]">{item.quantity}</td>
                    <td className="p-2 text-right text-[hsl(var(--foreground))]">{item.unitPriceTjs.toLocaleString()}</td>
                    <td className="p-2 text-right font-medium text-[hsl(var(--foreground))]">{item.totalTjs.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payments */}
          <div>
            <h3 className="font-medium text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Платежи ({sale.payments.length})
            </h3>

            {showAddPayment && (
              <form onSubmit={handleAddPayment} className="mb-4 p-3 bg-[hsl(var(--muted))]/30 rounded-lg space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={e => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={sale.debtTjs}
                    placeholder="Сумма TJS"
                    value={newPayment.amountTjs}
                    onChange={e => setNewPayment({ ...newPayment, amountTjs: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                    required
                  />
                  <select
                    value={newPayment.method}
                    onChange={e => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  >
                    <option value="Cash">Наличные</option>
                    <option value="BankTransfer">Перевод</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Примечание"
                    value={newPayment.notes}
                    onChange={e => setNewPayment({ ...newPayment, notes: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1.5 bg-[hsl(var(--success))] text-white rounded-lg text-sm"
                  >
                    {saving ? 'Добавление...' : 'Добавить платёж'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="px-3 py-1.5 border border-[hsl(var(--border))] rounded-lg text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {sale.payments.length === 0 ? (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-4">Нет платежей</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Дата</th>
                    <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Сумма (TJS)</th>
                    <th className="text-left p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Способ</th>
                    <th className="text-left p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Примечание</th>
                    <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm w-20">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.payments.map(payment => (
                    <tr key={payment.id} className="border-b border-[hsl(var(--border))] last:border-0">
                      <td className="p-2 text-[hsl(var(--foreground))]">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="p-2 text-right font-medium text-[hsl(var(--success))]">{payment.amountTjs.toLocaleString()}</td>
                      <td className="p-2 text-[hsl(var(--foreground))]">{paymentMethodLabels[payment.methodName] || payment.methodName}</td>
                      <td className="p-2 text-[hsl(var(--muted-foreground))]">{payment.notes || '-'}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-1 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] rounded"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Примечание</p>
              <p className="text-[hsl(var(--foreground))]">{sale.notes}</p>
            </div>
          )}
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
