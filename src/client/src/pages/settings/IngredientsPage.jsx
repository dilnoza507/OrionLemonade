import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, X, Archive, CheckCircle } from 'lucide-react';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../api/ingredients';
import { createReceipt } from '../../api/warehouse';
import { getBranches } from '../../api/branches';

const CATEGORIES = {
  Raw: { label: 'Сырьё', color: 'primary' },
  Packaging: { label: 'Упаковка', color: 'warning' },
  Other: { label: 'Прочее', color: 'muted' },
};

const BASE_UNITS = {
  Kg: 'кг',
  L: 'л',
  Pcs: 'шт',
};

const STATUSES = {
  Active: { label: 'Активен', color: 'success' },
  Archived: { label: 'Архив', color: 'muted' },
};

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [ingredientsData, branchesData] = await Promise.all([
        getIngredients(),
        getBranches()
      ]);
      setIngredients(ingredientsData);
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingIngredient(null); setIsModalOpen(true); }
  function handleEdit(ingredient) { setEditingIngredient(ingredient); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить ингредиент?')) return;
    try { await deleteIngredient(id); await loadData(); }
    catch (err) { setError('Не удалось удалить ингредиент'); }
  }

  async function handleSave(data, initialStock) {
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, data);
      } else {
        const newIngredient = await createIngredient(data);
        // If initial stock is provided, create a receipt
        if (initialStock && initialStock.quantity > 0 && initialStock.branchId) {
          await createReceipt({
            branchId: parseInt(initialStock.branchId),
            ingredientId: newIngredient.id,
            quantity: parseFloat(initialStock.quantity),
            unit: data.baseUnit,
            receiptDate: new Date().toISOString(),
            note: 'Начальный остаток'
          });
        }
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) { setError('Не удалось сохранить ингредиент'); }
  }

  const filteredIngredients = filter === 'all'
    ? ingredients
    : ingredients.filter(i => i.category === filter);

  const stats = {
    total: ingredients.length,
    raw: ingredients.filter(i => i.category === 'Raw').length,
    packaging: ingredients.filter(i => i.category === 'Packaging').length,
    other: ingredients.filter(i => i.category === 'Other').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Ингредиенты</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Справочник сырья, упаковки и материалов</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Сырьё</p>
          <p className="text-2xl font-bold text-[hsl(var(--primary))]">{stats.raw}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Упаковка</p>
          <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.packaging}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Прочее</p>
          <p className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">{stats.other}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'all', label: 'Все' }, ...Object.entries(CATEGORIES).map(([key, val]) => ({ key, label: val.label }))].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (<div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">{error}</div>)}

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[hsl(var(--muted-foreground))]">Загрузка...</div></div>
      ) : filteredIngredients.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет ингредиентов</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первый ингредиент</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить ингредиент
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[hsl(var(--card))]">
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Название</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Категория</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Ед. измерения</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Приходная ед.</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Коэфф.</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Мин. остаток</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ingredient, index) => {
                const category = CATEGORIES[ingredient.category] || { label: ingredient.category, color: 'muted' };
                const status = STATUSES[ingredient.status] || { label: ingredient.status, color: 'muted' };
                return (
                  <tr key={ingredient.id} className={index !== filteredIngredients.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-[hsl(var(--foreground))]">{ingredient.name}</span>
                        {ingredient.subcategory && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{ingredient.subcategory}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--${category.color}))]/10 text-[hsl(var(--${category.color}))]`}>
                        {category.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[hsl(var(--foreground))]">{BASE_UNITS[ingredient.baseUnit] || ingredient.baseUnit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{ingredient.purchaseUnit || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[hsl(var(--foreground))]">{ingredient.conversionRate}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{ingredient.minStock ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--${status.color}))]/10 text-[hsl(var(--${status.color}))]`}>
                        {ingredient.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(ingredient)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ingredient.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (<IngredientModal ingredient={editingIngredient} branches={branches} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function IngredientModal({ ingredient, branches, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || 'Raw',
    subcategory: ingredient?.subcategory || '',
    baseUnit: ingredient?.baseUnit || 'Kg',
    purchaseUnit: ingredient?.purchaseUnit || '',
    conversionRate: ingredient?.conversionRate || 1,
    minStock: ingredient?.minStock || '',
    shelfLifeDays: ingredient?.shelfLifeDays || '',
    status: ingredient?.status || 'Active',
  });

  const [initialStock, setInitialStock] = useState({
    quantity: '',
    branchId: branches?.length > 0 ? branches[0].id.toString() : '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...formData,
      minStock: formData.minStock ? parseFloat(formData.minStock) : null,
      shelfLifeDays: formData.shelfLifeDays ? parseInt(formData.shelfLifeDays) : null,
      conversionRate: parseFloat(formData.conversionRate),
      subcategory: formData.subcategory || null,
      purchaseUnit: formData.purchaseUnit || null,
    };
    onSave(data, !ingredient ? initialStock : null);
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{ingredient ? 'Редактировать ингредиент' : 'Новый ингредиент'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Сахар" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Категория *</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                {Object.entries(CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Подкатегория</label>
              <input type="text" value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className={inputClass} placeholder="Сыпучие" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Базовая ед. *</label>
              <select value={formData.baseUnit} onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })} className={inputClass}>
                {Object.entries(BASE_UNITS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Приходная ед.</label>
              <input type="text" value={formData.purchaseUnit} onChange={(e) => setFormData({ ...formData, purchaseUnit: e.target.value })} className={inputClass} placeholder="мешок" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Коэфф. пересчёта *</label>
              <input type="number" step="0.0001" min="0.0001" required value={formData.conversionRate} onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })} className={inputClass} placeholder="50" />
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Сколько базовых ед. в приходной</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Мин. остаток</label>
              <input type="number" step="0.01" min="0" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} className={inputClass} placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Срок годности (дни)</label>
              <input type="number" min="0" value={formData.shelfLifeDays} onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })} className={inputClass} placeholder="365" />
            </div>
            {ingredient && (
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Статус</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                  {Object.entries(STATUSES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Initial stock - only for new ingredients */}
          {!ingredient && branches?.length > 0 && (
            <div className="border-t border-[hsl(var(--border))] pt-4 mt-4">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-3">Начальный остаток (необязательно)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">Филиал</label>
                  <select value={initialStock.branchId} onChange={(e) => setInitialStock({ ...initialStock, branchId: e.target.value })} className={inputClass}>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1">Количество ({BASE_UNITS[formData.baseUnit]})</label>
                  <input type="number" step="0.01" min="0" value={initialStock.quantity} onChange={(e) => setInitialStock({ ...initialStock, quantity: e.target.value })} className={inputClass} placeholder="0" />
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{ingredient ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
