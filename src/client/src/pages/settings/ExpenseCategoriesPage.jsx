import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, X, Lock } from 'lucide-react';
import { getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../../api/expenseCategories';

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getExpenseCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить категории расходов');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingCategory(null); setIsModalOpen(true); }
  function handleEdit(category) { setEditingCategory(category); setIsModalOpen(true); }

  async function handleDelete(id, isSystem) {
    if (isSystem) {
      setError('Нельзя удалить системную категорию');
      return;
    }
    if (!confirm('Удалить категорию расходов?')) return;
    try {
      await deleteExpenseCategory(id);
      await loadCategories();
    } catch (err) {
      setError('Не удалось удалить категорию');
    }
  }

  async function handleSave(data) {
    try {
      if (editingCategory) {
        await updateExpenseCategory(editingCategory.id, data);
      } else {
        await createExpenseCategory(data);
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setError('Не удалось сохранить категорию');
    }
  }

  const stats = {
    total: categories.length,
    system: categories.filter(c => c.isSystem).length,
    custom: categories.filter(c => !c.isSystem).length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Категории расходов</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Справочник для классификации расходов</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Системные</p>
          <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.system}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Пользовательские</p>
          <p className="text-2xl font-bold text-[hsl(var(--primary))]">{stats.custom}</p>
        </div>
      </div>

      {error && (<div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">{error}</div>)}

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[hsl(var(--muted-foreground))]">Загрузка...</div></div>
      ) : categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><FolderOpen className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет категорий расходов</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первую категорию</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить категорию
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Название</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Описание</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Тип</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className={index !== categories.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">{category.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{category.description || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {category.isSystem ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                        <Lock className="w-3 h-3" />
                        Системная
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                        Пользовательская
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(category)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.isSystem)}
                        disabled={category.isSystem}
                        className={`p-2 rounded-lg transition-colors ${
                          category.isSystem
                            ? 'text-[hsl(var(--muted-foreground))]/50 cursor-not-allowed'
                            : 'text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10'
                        }`}
                      >
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

      {isModalOpen && (<ExpenseCategoryModal category={editingCategory} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function ExpenseCategoryModal({ category, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description || null,
    });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{category ? 'Редактировать категорию' : 'Новая категория'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Зарплата" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
              rows="3"
              placeholder="Расходы на оплату труда сотрудников"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{category ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
