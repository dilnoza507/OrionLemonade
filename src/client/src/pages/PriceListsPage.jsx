import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getPriceLists, createPriceList, updatePriceList, deletePriceList, getPriceListDetail, addPriceListItem, updatePriceListItem, deletePriceListItem } from '../api/priceLists';
import { getRecipes } from '../api/recipes';
import { getBranches } from '../api/branches';

const listTypeLabels = { Base: 'Базовый', Special: 'Специальный' };
const listTypeColors = {
  Base: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  Special: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPriceLists();
  }, [selectedBranch]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [branchesData, recipesData] = await Promise.all([
        getBranches(),
        getRecipes()
      ]);
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setRecipes(recipesData.filter(r => r.status === 'Active'));
      await loadPriceLists();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPriceLists() {
    try {
      const data = await getPriceLists(selectedBranch || null);
      setPriceLists(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить прайс-лист?')) return;
    try {
      await deletePriceList(id);
      await loadPriceLists();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(priceList) {
    try {
      const detail = await getPriceListDetail(priceList.id);
      setSelectedPriceList(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(priceList) {
    setSelectedPriceList(priceList);
    setShowEditModal(true);
  }

  const totalLists = priceLists.length;
  const activeLists = priceLists.filter(p => p.isActive).length;

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
              <p className={`${mutedClass} text-sm`}>Всего прайс-листов</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalLists}</p>
            </div>
            <Tag className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Активных</p>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">{activeLists}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Неактивных</p>
              <p className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">{totalLists - activeLists}</p>
            </div>
            <XCircle className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
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
      <div className="flex items-center justify-between">
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
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--primary))]/90"
        >
          <Plus className="w-4 h-4" />
          Создать прайс-лист
        </button>
      </div>

      {/* Price Lists Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Название</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Тип</th>
              <th className={`text-center p-3 ${mutedClass} font-medium`}>Позиций</th>
              <th className={`text-center p-3 ${mutedClass} font-medium`}>Статус</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {priceLists.length === 0 ? (
              <tr>
                <td colSpan={6} className={`p-8 text-center ${mutedClass}`}>
                  Нет прайс-листов
                </td>
              </tr>
            ) : (
              priceLists.map(pl => (
                <tr key={pl.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass}`}>
                    <div className="font-medium">{pl.name}</div>
                    {pl.description && (
                      <div className={`text-sm ${mutedClass}`}>{pl.description}</div>
                    )}
                  </td>
                  <td className={`p-3 ${textClass}`}>{pl.branchName || 'Общий'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${listTypeColors[pl.listType] || ''}`}>
                      {listTypeLabels[pl.listType] || pl.listType}
                    </span>
                  </td>
                  <td className={`p-3 text-center ${textClass}`}>{pl.itemCount}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pl.isActive
                        ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {pl.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetail(pl)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4 text-[hsl(var(--primary))]" />
                      </button>
                      <button
                        onClick={() => handleEdit(pl)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                      <button
                        onClick={() => handleDelete(pl.id)}
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
        <CreatePriceListModal
          branches={branches}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadPriceLists();
          }}
          setError={setError}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPriceList && (
        <EditPriceListModal
          priceList={selectedPriceList}
          branches={branches}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPriceList(null);
          }}
          onSave={async () => {
            setShowEditModal(false);
            setSelectedPriceList(null);
            await loadPriceLists();
          }}
          setError={setError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPriceList && (
        <PriceListDetailModal
          priceList={selectedPriceList}
          recipes={recipes}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPriceList(null);
          }}
          onRefresh={async () => {
            const detail = await getPriceListDetail(selectedPriceList.id);
            setSelectedPriceList(detail);
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreatePriceListModal({ branches, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    branchId: '',
    name: '',
    description: '',
    listType: 'Base'
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;

    setSaving(true);
    try {
      await createPriceList({
        branchId: form.branchId ? parseInt(form.branchId) : null,
        name: form.name,
        description: form.description || null,
        listType: form.listType
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
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Новый прайс-лист</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              placeholder="Базовый прайс"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
            <select
              value={form.branchId}
              onChange={e => setForm({ ...form, branchId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            >
              <option value="">Общий (все филиалы)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Тип</label>
            <select
              value={form.listType}
              onChange={e => setForm({ ...form, listType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            >
              <option value="Base">Базовый</option>
              <option value="Special">Специальный</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
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
              {saving ? 'Сохранение...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPriceListModal({ priceList, branches, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    name: priceList.name,
    description: priceList.description || '',
    listType: priceList.listType,
    isActive: priceList.isActive
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;

    setSaving(true);
    try {
      await updatePriceList(priceList.id, {
        name: form.name,
        description: form.description || null,
        listType: form.listType,
        isActive: form.isActive
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
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Редактировать прайс-лист</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Тип</label>
            <select
              value={form.listType}
              onChange={e => setForm({ ...form, listType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            >
              <option value="Base">Базовый</option>
              <option value="Special">Специальный</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-[hsl(var(--foreground))]">Активен</label>
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

function PriceListDetailModal({ priceList, recipes, onClose, onRefresh, setError }) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ recipeId: '', priceTjs: '', minOrderQuantity: '1' });
  const [saving, setSaving] = useState(false);

  const availableRecipes = recipes.filter(r => !priceList.items.some(i => i.recipeId === r.id));

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.recipeId || !newItem.priceTjs) return;

    setSaving(true);
    try {
      await addPriceListItem(priceList.id, {
        recipeId: parseInt(newItem.recipeId),
        priceTjs: parseFloat(newItem.priceTjs),
        minOrderQuantity: parseInt(newItem.minOrderQuantity) || 1
      });
      setNewItem({ recipeId: '', priceTjs: '', minOrderQuantity: '1' });
      setShowAddItem(false);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateItem(item) {
    if (!editingItem.priceTjs) return;

    setSaving(true);
    try {
      await updatePriceListItem(item.id, {
        priceTjs: parseFloat(editingItem.priceTjs),
        minOrderQuantity: parseInt(editingItem.minOrderQuantity) || 1
      });
      setEditingItem(null);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(id) {
    if (!confirm('Удалить позицию?')) return;
    try {
      await deletePriceListItem(id);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-3xl max-h-[80vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{priceList.name}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {priceList.branchName || 'Общий прайс'} | {priceList.listTypeName}
            </p>
          </div>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-[hsl(var(--foreground))]">Позиции ({priceList.items.length})</h3>
            {!showAddItem && (
              <button
                onClick={() => setShowAddItem(true)}
                className="px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            )}
          </div>

          {showAddItem && (
            <form onSubmit={handleAddItem} className="mb-4 p-3 bg-[hsl(var(--muted))]/30 rounded-lg space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={newItem.recipeId}
                  onChange={e => setNewItem({ ...newItem, recipeId: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  required
                >
                  <option value="">Выберите продукт</option>
                  {availableRecipes.map(r => (
                    <option key={r.id} value={r.id}>{r.productName}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Цена (TJS)"
                  value={newItem.priceTjs}
                  onChange={e => setNewItem({ ...newItem, priceTjs: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Мин. кол-во"
                  value={newItem.minOrderQuantity}
                  onChange={e => setNewItem({ ...newItem, minOrderQuantity: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm"
                >
                  {saving ? 'Добавление...' : 'Добавить'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="px-3 py-1.5 border border-[hsl(var(--border))] rounded-lg text-sm"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Продукт</th>
                <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Цена (TJS)</th>
                <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm">Мин. кол-во</th>
                <th className="text-right p-2 text-[hsl(var(--muted-foreground))] font-medium text-sm w-24">Действия</th>
              </tr>
            </thead>
            <tbody>
              {priceList.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-[hsl(var(--muted-foreground))]">
                    Нет позиций
                  </td>
                </tr>
              ) : (
                priceList.items.map(item => (
                  <tr key={item.id} className="border-b border-[hsl(var(--border))] last:border-0">
                    <td className="p-2 text-[hsl(var(--foreground))]">{item.productName}</td>
                    <td className="p-2 text-right">
                      {editingItem?.id === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingItem.priceTjs}
                          onChange={e => setEditingItem({ ...editingItem, priceTjs: e.target.value })}
                          className="w-24 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-right"
                        />
                      ) : (
                        <span className="text-[hsl(var(--foreground))]">{item.priceTjs.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {editingItem?.id === item.id ? (
                        <input
                          type="number"
                          min="1"
                          value={editingItem.minOrderQuantity}
                          onChange={e => setEditingItem({ ...editingItem, minOrderQuantity: e.target.value })}
                          className="w-20 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-right"
                        />
                      ) : (
                        <span className="text-[hsl(var(--foreground))]">{item.minOrderQuantity}</span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {editingItem?.id === item.id ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleUpdateItem(item)}
                            disabled={saving}
                            className="p-1 text-[hsl(var(--success))] hover:bg-[hsl(var(--muted))] rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingItem({ id: item.id, priceTjs: item.priceTjs.toString(), minOrderQuantity: item.minOrderQuantity.toString() })}
                            className="p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
