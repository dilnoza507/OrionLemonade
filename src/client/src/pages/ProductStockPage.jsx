import { useState, useEffect } from 'react';
import { Package, Plus, ArrowRightLeft, Trash2, X, TrendingDown, History, Building2 } from 'lucide-react';
import { getStocks, getStockSummary, getMovements, writeOffProduct, transferProduct } from '../api/productStock';
import { getRecipes } from '../api/recipes';
import { getBranches } from '../api/branches';

const operationTypeLabels = {
  Production: 'Производство',
  Sale: 'Продажа',
  Spoilage: 'Списание',
  Return: 'Возврат',
  TransferOut: 'Перемещение (исход)',
  TransferIn: 'Перемещение (приход)',
  Adjustment: 'Корректировка'
};

const operationTypeColors = {
  Production: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
  Sale: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  Spoilage: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]',
  Return: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  TransferOut: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  TransferIn: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  Adjustment: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function ProductStockPage() {
  const [summary, setSummary] = useState([]);
  const [movements, setMovements] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'movements') {
      loadMovements();
    }
  }, [selectedBranch, selectedRecipe, activeTab]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [recipesData, branchesData, summaryData] = await Promise.all([
        getRecipes(),
        getBranches(),
        getStockSummary()
      ]);
      setRecipes(recipesData.filter(r => r.status === 'Active'));
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const data = await getStockSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMovements() {
    try {
      const data = await getMovements(selectedBranch || null, selectedRecipe || null);
      setMovements(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalQuantity = summary.reduce((sum, b) => sum + b.totalQuantity, 0);
  const totalValueTjs = summary.reduce((sum, b) => sum + b.totalValueTjs, 0);
  const totalValueUsd = summary.reduce((sum, b) => sum + b.totalValueUsd, 0);
  const totalProducts = summary.reduce((sum, b) => sum + b.products.length, 0);

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
              <p className={`${mutedClass} text-sm`}>Всего единиц</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalQuantity}</p>
            </div>
            <Package className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Стоимость (TJS)</p>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">{totalValueTjs.toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Стоимость (USD)</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">${totalValueUsd.toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Видов продукции</p>
              <p className="text-2xl font-bold text-[hsl(var(--warning))]">{totalProducts}</p>
            </div>
            <Building2 className="w-8 h-8 text-[hsl(var(--warning))]" />
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

      {/* Tabs and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: 'summary', label: 'Остатки', icon: Package },
            { key: 'movements', label: 'Движения', icon: History }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWriteOffModal(true)}
            className="px-4 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--destructive))]/90"
          >
            <Trash2 className="w-4 h-4" />
            Списание
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--secondary))]/90"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Перемещение
          </button>
        </div>
      </div>

      {/* Filters for Movements */}
      {activeTab === 'movements' && (
        <div className="flex gap-4">
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
            value={selectedRecipe}
            onChange={e => setSelectedRecipe(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          >
            <option value="">Все продукты</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.productName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'summary' ? (
        <div className="flex-1 min-h-0 space-y-4 overflow-auto">
          {summary.length === 0 ? (
            <div className={`${cardClass} p-8 text-center ${mutedClass}`}>
              Нет данных о запасах готовой продукции
            </div>
          ) : (
            summary.map(branch => (
              <div key={branch.branchId} className={cardClass}>
                <div className="p-4 border-b border-[hsl(var(--border))] flex justify-between items-center">
                  <div>
                    <h3 className={`font-semibold ${textClass}`}>{branch.branchName}</h3>
                    <p className={`text-sm ${mutedClass}`}>
                      {branch.totalQuantity} ед. | {branch.totalValueTjs.toFixed(2)} TJS | ${branch.totalValueUsd.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))]">
                        <th className={`text-left p-3 ${mutedClass} font-medium`}>Продукт</th>
                        <th className={`text-right p-3 ${mutedClass} font-medium`}>Количество</th>
                        <th className={`text-right p-3 ${mutedClass} font-medium`}>Стоимость TJS</th>
                        <th className={`text-right p-3 ${mutedClass} font-medium`}>Стоимость USD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branch.products.map(product => (
                        <tr key={product.recipeId} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                          <td className={`p-3 ${textClass}`}>
                            <div className="font-medium">{product.productName}</div>
                            <div className={`text-sm ${mutedClass}`}>{product.recipeName}</div>
                          </td>
                          <td className={`p-3 text-right ${textClass}`}>{product.totalQuantity} шт</td>
                          <td className={`p-3 text-right ${textClass}`}>{product.totalValueTjs.toFixed(2)}</td>
                          <td className={`p-3 text-right ${textClass}`}>${product.totalValueUsd.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[hsl(var(--card))]">
              <tr className="border-b border-[hsl(var(--border))]">
                <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
                <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
                <th className={`text-left p-3 ${mutedClass} font-medium`}>Продукт</th>
                <th className={`text-left p-3 ${mutedClass} font-medium`}>Операция</th>
                <th className={`text-right p-3 ${mutedClass} font-medium`}>Количество</th>
                <th className={`text-right p-3 ${mutedClass} font-medium`}>Остаток</th>
                <th className={`text-left p-3 ${mutedClass} font-medium`}>Примечание</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`p-8 text-center ${mutedClass}`}>
                    Нет движений
                  </td>
                </tr>
              ) : (
                movements.map(m => (
                  <tr key={m.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                    <td className={`p-3 ${textClass}`}>
                      {new Date(m.movementDate).toLocaleDateString('ru-RU')}
                    </td>
                    <td className={`p-3 ${textClass}`}>{m.branchName}</td>
                    <td className={`p-3 ${textClass}`}>{m.productName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${operationTypeColors[m.operationType] || ''}`}>
                        {operationTypeLabels[m.operationType] || m.operationType}
                      </span>
                    </td>
                    <td className={`p-3 text-right ${m.quantity > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td className={`p-3 text-right ${textClass}`}>{m.balanceAfter}</td>
                    <td className={`p-3 ${mutedClass} text-sm`}>{m.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* WriteOff Modal */}
      {showWriteOffModal && (
        <WriteOffModal
          branches={branches}
          recipes={recipes}
          onClose={() => setShowWriteOffModal(false)}
          onSave={async () => {
            setShowWriteOffModal(false);
            await loadSummary();
            if (activeTab === 'movements') await loadMovements();
          }}
          setError={setError}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          branches={branches}
          recipes={recipes}
          onClose={() => setShowTransferModal(false)}
          onSave={async () => {
            setShowTransferModal(false);
            await loadSummary();
            if (activeTab === 'movements') await loadMovements();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function WriteOffModal({ branches, recipes, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    branchId: '',
    recipeId: '',
    quantity: '',
    reason: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.branchId || !form.recipeId || !form.quantity || !form.reason) return;

    setSaving(true);
    try {
      await writeOffProduct({
        branchId: parseInt(form.branchId),
        recipeId: parseInt(form.recipeId),
        quantity: parseInt(form.quantity),
        reason: form.reason,
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
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Списание</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
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
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Продукт</label>
            <select
              value={form.recipeId}
              onChange={e => setForm({ ...form, recipeId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            >
              <option value="">Выберите продукт</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.productName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Количество</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
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
              required
            >
              <option value="">Выберите причину</option>
              <option value="Просрочено">Просрочено</option>
              <option value="Брак">Брак</option>
              <option value="Повреждение">Повреждение</option>
              <option value="Другое">Другое</option>
            </select>
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
              className="px-4 py-2 rounded-lg bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90 disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Списать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransferModal({ branches, recipes, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    fromBranchId: '',
    toBranchId: '',
    recipeId: '',
    quantity: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fromBranchId || !form.toBranchId || !form.recipeId || !form.quantity) return;
    if (form.fromBranchId === form.toBranchId) {
      setError('Филиалы отправления и назначения должны быть разными');
      return;
    }

    setSaving(true);
    try {
      await transferProduct({
        fromBranchId: parseInt(form.fromBranchId),
        toBranchId: parseInt(form.toBranchId),
        recipeId: parseInt(form.recipeId),
        quantity: parseInt(form.quantity),
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
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Перемещение</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Откуда</label>
            <select
              value={form.fromBranchId}
              onChange={e => setForm({ ...form, fromBranchId: e.target.value })}
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
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Куда</label>
            <select
              value={form.toBranchId}
              onChange={e => setForm({ ...form, toBranchId: e.target.value })}
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
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Продукт</label>
            <select
              value={form.recipeId}
              onChange={e => setForm({ ...form, recipeId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            >
              <option value="">Выберите продукт</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.productName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Количество</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
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
              {saving ? 'Сохранение...' : 'Переместить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
