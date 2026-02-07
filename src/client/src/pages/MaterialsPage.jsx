import { useState, useEffect } from 'react';
import { Package, TrendingDown, TrendingUp, ArrowRightLeft, AlertTriangle, Plus, Trash2, X } from 'lucide-react';
import { getAllStock, getStockByBranch, getLowStock, getStockSummary, getReceipts, createReceipt, deleteReceipt, getWriteOffs, createWriteOff, deleteWriteOff, getMovements } from '../api/warehouse';
import { getIngredients } from '../api/ingredients';
import { getBranches } from '../api/branches';
import { getSuppliers } from '../api/suppliers';

const unitLabels = { Kg: 'кг', L: 'л', Pcs: 'шт' };
const currencyLabels = { Uzs: 'UZS', Usd: 'USD', Tjs: 'TJS' };
const reasonLabels = { Expired: 'Срок годности', Damaged: 'Повреждение', Lost: 'Утеря', Production: 'Производство', Other: 'Другое' };
const movementTypeLabels = { Receipt: 'Приход', WriteOff: 'Списание', Production: 'Производство', TransferIn: 'Вход', TransferOut: 'Выход', Adjustment: 'Корректировка' };

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState('stock');
  const [stock, setStock] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [writeOffs, setWriteOffs] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [ingredients, setIngredients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock') loadStock();
    else if (activeTab === 'receipts') loadReceipts();
    else if (activeTab === 'writeoffs') loadWriteOffs();
    else if (activeTab === 'movements') loadMovements();
  }, [activeTab, selectedBranch]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [ingredientsData, branchesData, suppliersData, summaryData, lowStockData] = await Promise.all([
        getIngredients(),
        getBranches(),
        getSuppliers(),
        getStockSummary(),
        getLowStock()
      ]);
      setIngredients(ingredientsData.filter(i => i.status === 'Active'));
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setSuppliers(suppliersData.filter(s => s.status === 'Active'));
      setSummary(summaryData);
      setLowStock(lowStockData);
      await loadStock();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStock() {
    try {
      const data = selectedBranch ? await getStockByBranch(selectedBranch) : await getAllStock();
      setStock(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadReceipts() {
    try {
      const data = await getReceipts(selectedBranch || null);
      setReceipts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadWriteOffs() {
    try {
      const data = await getWriteOffs(selectedBranch || null);
      setWriteOffs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMovements() {
    try {
      const data = await getMovements(selectedBranch || null);
      setMovements(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteReceipt(id) {
    if (!confirm('Удалить приход? Остатки будут скорректированы.')) return;
    try {
      await deleteReceipt(id);
      await loadReceipts();
      await loadStock();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteWriteOff(id) {
    if (!confirm('Удалить списание? Остатки будут скорректированы.')) return;
    try {
      await deleteWriteOff(id);
      await loadWriteOffs();
      await loadStock();
    } catch (err) {
      setError(err.message);
    }
  }

  const tabs = [
    { id: 'stock', label: 'Остатки', icon: Package },
    { id: 'receipts', label: 'Приход', icon: TrendingUp },
    { id: 'writeoffs', label: 'Списания', icon: TrendingDown },
    { id: 'movements', label: 'Движения', icon: ArrowRightLeft }
  ];

  const totalItems = summary.reduce((sum, s) => sum + s.totalItems, 0);
  const totalLow = summary.reduce((sum, s) => sum + s.lowStockItems, 0);
  const totalOut = summary.reduce((sum, s) => sum + s.outOfStockItems, 0);

  if (loading) {
    return <div className="p-6 text-[hsl(var(--muted-foreground))]">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Всего позиций</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Мало на складе</p>
              <p className="text-2xl font-bold text-[hsl(var(--warning))]">{totalLow}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[hsl(var(--warning))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Нет на складе</p>
              <p className="text-2xl font-bold text-[hsl(var(--destructive))]">{totalOut}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-[hsl(var(--destructive))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Филиалов</p>
              <p className={`text-2xl font-bold ${textClass}`}>{branches.length}</p>
            </div>
            <Package className={`w-8 h-8 ${mutedClass}`} />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />
            <span className="text-[hsl(var(--warning))] font-medium">Требуется пополнение ({lowStock.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.slice(0, 10).map(item => (
              <span key={item.id} className="bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] text-xs px-2 py-1 rounded">
                {item.ingredientName} ({item.branchName}): {item.quantity} {unitLabels[item.unit] || item.unit}
              </span>
            ))}
            {lowStock.length > 10 && (
              <span className="text-[hsl(var(--warning))] text-xs">и ещё {lowStock.length - 10}...</span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-xl p-4 text-[hsl(var(--destructive))]">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Закрыть</button>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-[hsl(var(--foreground))]"
          >
            <option value="">Все филиалы</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {activeTab === 'receipts' && (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-2 bg-[hsl(var(--success))] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Добавить приход
            </button>
          )}
          {activeTab === 'writeoffs' && (
            <button
              onClick={() => setShowWriteOffModal(true)}
              className="flex items-center gap-2 bg-[hsl(var(--destructive))] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Добавить списание
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${cardClass} overflow-hidden`}>
        {activeTab === 'stock' && (
          <table className="w-full">
            <thead className="bg-[hsl(var(--muted))]/50">
              <tr>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Филиал</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Ингредиент</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Категория</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Количество</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Мин. запас</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {stock.map(item => {
                const isLow = item.minStock && item.quantity <= item.minStock;
                const isOut = item.quantity <= 0;
                return (
                  <tr key={item.id} className="hover:bg-[hsl(var(--muted))]/30">
                    <td className={`p-4 ${textClass}`}>{item.branchName}</td>
                    <td className={`p-4 ${textClass}`}>{item.ingredientName}</td>
                    <td className={`p-4 ${mutedClass}`}>{item.ingredientCategory}</td>
                    <td className={`p-4 text-right ${textClass}`}>{item.quantity} {unitLabels[item.unit] || item.unit}</td>
                    <td className={`p-4 text-right ${mutedClass}`}>{item.minStock ? `${item.minStock} ${unitLabels[item.unit] || item.unit}` : '-'}</td>
                    <td className="p-4">
                      {isOut ? (
                        <span className="bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] text-xs px-2 py-1 rounded">Нет</span>
                      ) : isLow ? (
                        <span className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] text-xs px-2 py-1 rounded">Мало</span>
                      ) : (
                        <span className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] text-xs px-2 py-1 rounded">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {stock.length === 0 && (
                <tr>
                  <td colSpan={6} className={`p-8 text-center ${mutedClass}`}>Нет данных о остатках</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'receipts' && (
          <table className="w-full">
            <thead className="bg-[hsl(var(--muted))]/50">
              <tr>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Дата</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Филиал</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Ингредиент</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Поставщик</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Количество</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Сумма</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Документ</th>
                <th className={`text-center ${mutedClass} font-medium p-4`}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {receipts.map(item => (
                <tr key={item.id} className="hover:bg-[hsl(var(--muted))]/30">
                  <td className={`p-4 ${textClass}`}>{new Date(item.receiptDate).toLocaleDateString('ru-RU')}</td>
                  <td className={`p-4 ${textClass}`}>{item.branchName}</td>
                  <td className={`p-4 ${textClass}`}>{item.ingredientName}</td>
                  <td className={`p-4 ${mutedClass}`}>{item.supplierName || '-'}</td>
                  <td className={`p-4 text-right ${textClass}`}>{item.quantity} {unitLabels[item.unit] || item.unit}</td>
                  <td className="p-4 text-right text-[hsl(var(--success))]">{item.totalPrice} {currencyLabels[item.currency] || item.currency}</td>
                  <td className={`p-4 ${mutedClass}`}>{item.documentNumber || '-'}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDeleteReceipt(item.id)} className="text-[hsl(var(--destructive))] hover:opacity-80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={8} className={`p-8 text-center ${mutedClass}`}>Нет данных о приходах</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'writeoffs' && (
          <table className="w-full">
            <thead className="bg-[hsl(var(--muted))]/50">
              <tr>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Дата</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Филиал</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Ингредиент</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Количество</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Причина</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Примечание</th>
                <th className={`text-center ${mutedClass} font-medium p-4`}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {writeOffs.map(item => (
                <tr key={item.id} className="hover:bg-[hsl(var(--muted))]/30">
                  <td className={`p-4 ${textClass}`}>{new Date(item.writeOffDate).toLocaleDateString('ru-RU')}</td>
                  <td className={`p-4 ${textClass}`}>{item.branchName}</td>
                  <td className={`p-4 ${textClass}`}>{item.ingredientName}</td>
                  <td className="p-4 text-right text-[hsl(var(--destructive))]">-{item.quantity} {unitLabels[item.unit] || item.unit}</td>
                  <td className={`p-4 ${mutedClass}`}>{reasonLabels[item.reason] || item.reason}</td>
                  <td className={`p-4 ${mutedClass}`}>{item.notes || '-'}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDeleteWriteOff(item.id)} className="text-[hsl(var(--destructive))] hover:opacity-80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {writeOffs.length === 0 && (
                <tr>
                  <td colSpan={7} className={`p-8 text-center ${mutedClass}`}>Нет данных о списаниях</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'movements' && (
          <table className="w-full">
            <thead className="bg-[hsl(var(--muted))]/50">
              <tr>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Дата</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Филиал</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Ингредиент</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Тип</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Количество</th>
                <th className={`text-right ${mutedClass} font-medium p-4`}>Остаток</th>
                <th className={`text-left ${mutedClass} font-medium p-4`}>Примечание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {movements.map(item => (
                <tr key={item.id} className="hover:bg-[hsl(var(--muted))]/30">
                  <td className={`p-4 ${textClass}`}>{new Date(item.movementDate).toLocaleDateString('ru-RU')}</td>
                  <td className={`p-4 ${textClass}`}>{item.branchName}</td>
                  <td className={`p-4 ${textClass}`}>{item.ingredientName}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.movementType === 'Receipt' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' :
                      item.movementType === 'WriteOff' ? 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]' :
                      'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {movementTypeLabels[item.movementType] || item.movementType}
                    </span>
                  </td>
                  <td className={`p-4 text-right ${item.quantity > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                    {item.quantity > 0 ? '+' : ''}{item.quantity} {unitLabels[item.unit] || item.unit}
                  </td>
                  <td className={`p-4 text-right ${textClass}`}>{item.balanceAfter} {unitLabels[item.unit] || item.unit}</td>
                  <td className={`p-4 ${mutedClass}`}>{item.notes || '-'}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={7} className={`p-8 text-center ${mutedClass}`}>Нет данных о движениях</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          ingredients={ingredients}
          branches={branches}
          suppliers={suppliers}
          onClose={() => setShowReceiptModal(false)}
          onSave={async () => {
            setShowReceiptModal(false);
            await loadReceipts();
            await loadStock();
          }}
        />
      )}

      {/* WriteOff Modal */}
      {showWriteOffModal && (
        <WriteOffModal
          ingredients={ingredients}
          branches={branches}
          onClose={() => setShowWriteOffModal(false)}
          onSave={async () => {
            setShowWriteOffModal(false);
            await loadWriteOffs();
            await loadStock();
          }}
        />
      )}
    </div>
  );
}

function ReceiptModal({ ingredients, branches, suppliers, onClose, onSave }) {
  const [form, setForm] = useState({
    branchId: '',
    ingredientId: '',
    supplierId: '',
    quantity: '',
    unit: 'Kg',
    unitPrice: '',
    currency: 'Uzs',
    receiptDate: new Date().toISOString().split('T')[0],
    documentNumber: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.branchId || !form.ingredientId || !form.quantity || !form.unitPrice) {
      setError('Заполните обязательные поля');
      return;
    }
    setLoading(true);
    try {
      await createReceipt({
        ...form,
        branchId: parseInt(form.branchId),
        ingredientId: parseInt(form.ingredientId),
        supplierId: form.supplierId ? parseInt(form.supplierId) : null,
        quantity: parseFloat(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
        receiptDate: new Date(form.receiptDate).toISOString()
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Добавить приход</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-lg p-3 mb-4 text-[hsl(var(--destructive))] text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Филиал *</label>
              <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className={inputClass}>
                <option value="">Выберите</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Дата *</label>
              <input type="date" value={form.receiptDate} onChange={e => setForm({ ...form, receiptDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Ингредиент *</label>
            <select value={form.ingredientId} onChange={e => setForm({ ...form, ingredientId: e.target.value })} className={inputClass}>
              <option value="">Выберите</option>
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Поставщик</label>
            <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className={inputClass}>
              <option value="">Не выбран</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Количество *</label>
              <input type="number" step="0.0001" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Ед. изм.</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                <option value="Kg">кг</option>
                <option value="L">л</option>
                <option value="Pcs">шт</option>
              </select>
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Цена за ед. *</label>
              <input type="number" step="0.01" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Валюта</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                <option value="Uzs">UZS</option>
                <option value="Usd">USD</option>
                <option value="Tjs">TJS</option>
              </select>
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Номер документа</label>
              <input type="text" value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Примечание</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Отмена</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[hsl(var(--success))] hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WriteOffModal({ ingredients, branches, onClose, onSave }) {
  const [form, setForm] = useState({
    branchId: '',
    ingredientId: '',
    quantity: '',
    unit: 'Kg',
    reason: 'Expired',
    writeOffDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.branchId || !form.ingredientId || !form.quantity) {
      setError('Заполните обязательные поля');
      return;
    }
    setLoading(true);
    try {
      await createWriteOff({
        ...form,
        branchId: parseInt(form.branchId),
        ingredientId: parseInt(form.ingredientId),
        quantity: parseFloat(form.quantity),
        writeOffDate: new Date(form.writeOffDate).toISOString()
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Добавить списание</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-lg p-3 mb-4 text-[hsl(var(--destructive))] text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Филиал *</label>
              <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className={inputClass}>
                <option value="">Выберите</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Дата *</label>
              <input type="date" value={form.writeOffDate} onChange={e => setForm({ ...form, writeOffDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Ингредиент *</label>
            <select value={form.ingredientId} onChange={e => setForm({ ...form, ingredientId: e.target.value })} className={inputClass}>
              <option value="">Выберите</option>
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Количество *</label>
              <input type="number" step="0.0001" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Ед. изм.</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                <option value="Kg">кг</option>
                <option value="L">л</option>
                <option value="Pcs">шт</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Причина</label>
            <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className={inputClass}>
              <option value="Expired">Срок годности</option>
              <option value="Damaged">Повреждение</option>
              <option value="Lost">Утеря</option>
              <option value="Production">Производство</option>
              <option value="Other">Другое</option>
            </select>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Примечание</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Отмена</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[hsl(var(--destructive))] hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Сохранение...' : 'Списать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
