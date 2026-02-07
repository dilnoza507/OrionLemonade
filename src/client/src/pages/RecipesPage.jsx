import { useState, useEffect } from 'react';
import { BookOpen, Plus, Pencil, Trash2, X, Archive, CheckCircle, FileText, ChevronRight, Play, Layers } from 'lucide-react';
import { getRecipes, getRecipeDetail, createRecipe, updateRecipe, deleteRecipe, createRecipeVersion, updateRecipeVersion, activateRecipeVersion, deleteRecipeVersion } from '../api/recipes';
import { getIngredients } from '../api/ingredients';

const STATUSES = {
  Draft: { label: 'Черновик', color: 'warning' },
  Active: { label: 'Активен', color: 'success' },
  Archived: { label: 'Архив', color: 'muted' },
};

const BASE_UNITS = {
  Kg: 'кг',
  L: 'л',
  Pcs: 'шт',
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingVersion, setEditingVersion] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadRecipes(); }, []);

  useEffect(() => {
    if (selectedRecipe) {
      loadRecipeDetail(selectedRecipe.id);
    } else {
      setRecipeDetail(null);
    }
  }, [selectedRecipe]);

  async function loadRecipes() {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить рецепты');
    } finally {
      setLoading(false);
    }
  }

  async function loadRecipeDetail(id) {
    try {
      setDetailLoading(true);
      const data = await getRecipeDetail(id);
      setRecipeDetail(data);
    } catch (err) {
      setError('Не удалось загрузить детали рецепта');
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAddRecipe() { setEditingRecipe(null); setIsRecipeModalOpen(true); }
  function handleEditRecipe(recipe) { setEditingRecipe(recipe); setIsRecipeModalOpen(true); }
  function handleAddVersion() { setEditingVersion(null); setIsVersionModalOpen(true); }
  function handleEditVersion(version) { setEditingVersion(version); setIsVersionModalOpen(true); }

  async function handleDeleteRecipe(id) {
    if (!confirm('Удалить рецепт и все его версии?')) return;
    try {
      await deleteRecipe(id);
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
      }
      await loadRecipes();
    } catch (err) {
      setError('Не удалось удалить рецепт');
    }
  }

  async function handleSaveRecipe(data) {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, data);
      } else {
        await createRecipe(data);
      }
      setIsRecipeModalOpen(false);
      await loadRecipes();
    } catch (err) {
      setError('Не удалось сохранить рецепт');
    }
  }

  async function handleSaveVersion(data) {
    try {
      if (editingVersion) {
        await updateRecipeVersion(editingVersion.id, data);
      } else {
        await createRecipeVersion({ ...data, recipeId: selectedRecipe.id });
      }
      setIsVersionModalOpen(false);
      setEditingVersion(null);
      await loadRecipeDetail(selectedRecipe.id);
      await loadRecipes();
    } catch (err) {
      setError(editingVersion ? 'Не удалось обновить версию' : 'Не удалось создать версию');
    }
  }

  async function handleActivateVersion(versionId) {
    try {
      await activateRecipeVersion(versionId);
      await loadRecipeDetail(selectedRecipe.id);
      await loadRecipes();
    } catch (err) {
      setError('Не удалось активировать версию');
    }
  }

  async function handleDeleteVersion(versionId) {
    if (!confirm('Удалить версию рецепта?')) return;
    try {
      await deleteRecipeVersion(versionId);
      await loadRecipeDetail(selectedRecipe.id);
      await loadRecipes();
    } catch (err) {
      setError('Не удалось удалить версию (возможно она активна)');
    }
  }

  const filteredRecipes = filter === 'all'
    ? recipes
    : recipes.filter(r => r.status === filter);

  const stats = {
    total: recipes.length,
    active: recipes.filter(r => r.status === 'Active').length,
    draft: recipes.filter(r => r.status === 'Draft').length,
    archived: recipes.filter(r => r.status === 'Archived').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Рецептуры</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Справочник рецептов лимонадов с ингредиентами</p>
        </div>
        <button onClick={handleAddRecipe} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить рецепт
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Активных</p>
          <p className="text-2xl font-bold text-[hsl(var(--success))]">{stats.active}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Черновики</p>
          <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.draft}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">В архиве</p>
          <p className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">{stats.archived}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Все' },
          { key: 'Active', label: 'Активные' },
          { key: 'Draft', label: 'Черновики' },
          { key: 'Archived', label: 'Архив' },
        ].map(tab => (
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
      ) : filteredRecipes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет рецептов</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первый рецепт</p>
            <button onClick={handleAddRecipe} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить рецепт
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Recipe list */}
          <div className="w-1/3 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1">
              {filteredRecipes.map((recipe) => {
                const status = STATUSES[recipe.status] || { label: recipe.status, color: 'muted' };
                const isSelected = selectedRecipe?.id === recipe.id;
                return (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`p-4 border-b border-[hsl(var(--border))] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[hsl(var(--primary))]/10' : 'hover:bg-[hsl(var(--muted))]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{recipe.name}</span>
                          <ChevronRight className={`w-4 h-4 text-[hsl(var(--muted-foreground))] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{recipe.productName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-[hsl(var(--${status.color}))]/10 text-[hsl(var(--${status.color}))]`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {recipe.outputVolume} {BASE_UNITS[recipe.outputUnit] || recipe.outputUnit}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            v{recipe.versionCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe); }} className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id); }} className="p-1.5 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipe detail */}
          <div className="flex-1 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden flex flex-col">
            {!selectedRecipe ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Выберите рецепт для просмотра деталей</p>
                </div>
              </div>
            ) : detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-[hsl(var(--muted-foreground))]">Загрузка...</div>
              </div>
            ) : recipeDetail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-[hsl(var(--border))]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{recipeDetail.name}</h2>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{recipeDetail.productName}</p>
                      {recipeDetail.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{recipeDetail.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Выход:</p>
                      <p className="text-lg font-medium text-[hsl(var(--foreground))]">
                        {recipeDetail.outputVolume} {BASE_UNITS[recipeDetail.outputUnit] || recipeDetail.outputUnit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Versions */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Версии ({recipeDetail.versions?.length || 0})
                    </h3>
                    <button onClick={handleAddVersion} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
                      <Plus className="w-3.5 h-3.5" />Новая версия
                    </button>
                  </div>

                  {recipeDetail.versions?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Нет версий. Создайте первую версию рецепта.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recipeDetail.versions?.map((version) => (
                        <div key={version.id} className={`border rounded-lg p-4 ${version.isActive ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/5' : 'border-[hsl(var(--border))]'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Версия {version.versionNumber}</span>
                              {version.isActive && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />Активна
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditVersion(version)} className="p-1.5 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 rounded-lg transition-colors" title="Редактировать">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {!version.isActive && (
                                <>
                                  <button onClick={() => handleActivateVersion(version.id)} className="p-1.5 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10 rounded-lg transition-colors" title="Активировать">
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteVersion(version.id)} className="p-1.5 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors" title="Удалить">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {version.notes && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{version.notes}</p>
                          )}

                          {/* Ingredients */}
                          {version.ingredients?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Ингредиенты:</p>
                              <div className="flex flex-wrap gap-1">
                                {version.ingredients.map((ing) => (
                                  <span key={ing.id} className="text-xs px-2 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded">
                                    {ing.ingredientName}: {ing.quantity} {BASE_UNITS[ing.unit] || ing.unit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Packaging */}
                          {version.packaging?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Упаковка:</p>
                              <div className="flex flex-wrap gap-1">
                                {version.packaging.map((pkg) => (
                                  <span key={pkg.id} className="text-xs px-2 py-1 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] rounded">
                                    {pkg.ingredientName}: {pkg.quantity} {BASE_UNITS[pkg.unit] || pkg.unit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                            Создано: {new Date(version.createdAt).toLocaleDateString('ru-RU')}
                            {version.createdByUserLogin && ` • ${version.createdByUserLogin}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {isRecipeModalOpen && (<RecipeModal recipe={editingRecipe} onSave={handleSaveRecipe} onClose={() => setIsRecipeModalOpen(false)} />)}
      {isVersionModalOpen && (<VersionModal recipeId={selectedRecipe?.id} version={editingVersion} onSave={handleSaveVersion} onClose={() => { setIsVersionModalOpen(false); setEditingVersion(null); }} />)}
    </div>
  );
}

function RecipeModal({ recipe, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    productName: recipe?.productName || '',
    outputVolume: recipe?.outputVolume || 1,
    outputUnit: recipe?.outputUnit || 'L',
    status: recipe?.status || 'Draft',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...formData,
      outputVolume: parseFloat(formData.outputVolume),
      description: formData.description || null,
    });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{recipe ? 'Редактировать рецепт' : 'Новый рецепт'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название рецепта *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Лимонад Классический" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название продукта *</label>
            <input type="text" required value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} className={inputClass} placeholder="Лимонад Классический 0.5л" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Описание</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} rows={3} placeholder="Описание рецепта..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Выход *</label>
              <input type="number" step="0.01" min="0.01" required value={formData.outputVolume} onChange={(e) => setFormData({ ...formData, outputVolume: e.target.value })} className={inputClass} placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Ед. измерения *</label>
              <select value={formData.outputUnit} onChange={(e) => setFormData({ ...formData, outputUnit: e.target.value })} className={inputClass}>
                {Object.entries(BASE_UNITS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          {recipe && (
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Статус</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                {Object.entries(STATUSES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{recipe ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VersionModal({ recipeId, version, onSave, onClose }) {
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    notes: version?.notes || '',
    ingredients: version?.ingredients?.map(i => ({
      ingredientId: String(i.ingredientId),
      quantity: String(i.quantity),
      unit: i.unit
    })) || [],
    packaging: version?.packaging?.map(p => ({
      ingredientId: String(p.ingredientId),
      quantity: String(p.quantity),
      unit: p.unit
    })) || [],
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    try {
      const data = await getIngredients();
      setAllIngredients(data);
    } catch (err) {
      console.error('Failed to load ingredients', err);
    } finally {
      setLoading(false);
    }
  }

  function addIngredient() {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: '', quantity: '', unit: 'Kg' }]
    });
  }

  function removeIngredient(index) {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  }

  function updateIngredient(index, field, value) {
    const updated = [...formData.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ingredients: updated });
  }

  function addPackaging() {
    setFormData({
      ...formData,
      packaging: [...formData.packaging, { ingredientId: '', quantity: '', unit: 'Pcs' }]
    });
  }

  function removePackaging(index) {
    setFormData({
      ...formData,
      packaging: formData.packaging.filter((_, i) => i !== index)
    });
  }

  function updatePackaging(index, field, value) {
    const updated = [...formData.packaging];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, packaging: updated });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      notes: formData.notes || null,
      ingredients: formData.ingredients
        .filter(i => i.ingredientId && i.quantity)
        .map(i => ({
          ingredientId: parseInt(i.ingredientId),
          quantity: parseFloat(i.quantity),
          unit: i.unit
        })),
      packaging: formData.packaging
        .filter(p => p.ingredientId && p.quantity)
        .map(p => ({
          ingredientId: parseInt(p.ingredientId),
          quantity: parseFloat(p.quantity),
          unit: p.unit
        })),
    });
  }

  const rawIngredients = allIngredients.filter(i => i.category === 'Raw' || i.category === 'Other');
  const packagingIngredients = allIngredients.filter(i => i.category === 'Packaging');

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{version ? `Редактировать версию ${version.versionNumber}` : 'Новая версия рецепта'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Загрузка ингредиентов...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Примечания к версии</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={2} placeholder="Изменения в этой версии..." />
            </div>

            {/* Ingredients section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">Ингредиенты</label>
                <button type="button" onClick={addIngredient} className="flex items-center gap-1 px-2 py-1 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded hover:bg-[hsl(var(--primary))]/20 transition-colors">
                  <Plus className="w-3 h-3" />Добавить
                </button>
              </div>
              {formData.ingredients.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">Нет ингредиентов. Нажмите "Добавить".</p>
              ) : (
                <div className="space-y-2">
                  {formData.ingredients.map((ing, index) => (
                    <div key={index} className="grid grid-cols-[1fr_80px_60px_40px] gap-2 items-center">
                      <select value={ing.ingredientId} onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)} className={inputClass}>
                        <option value="">Выберите ингредиент</option>
                        {rawIngredients.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                      <input type="number" step="0.0001" min="0" value={ing.quantity} onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} className={inputClass} placeholder="Кол-во" />
                      <select value={ing.unit} onChange={(e) => updateIngredient(index, 'unit', e.target.value)} className={inputClass}>
                        {Object.entries(BASE_UNITS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors justify-self-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Packaging section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">Упаковка</label>
                <button type="button" onClick={addPackaging} className="flex items-center gap-1 px-2 py-1 text-xs bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] rounded hover:bg-[hsl(var(--warning))]/20 transition-colors">
                  <Plus className="w-3 h-3" />Добавить
                </button>
              </div>
              {formData.packaging.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">Нет упаковки. Нажмите "Добавить".</p>
              ) : (
                <div className="space-y-2">
                  {formData.packaging.map((pkg, index) => (
                    <div key={index} className="grid grid-cols-[1fr_80px_60px_40px] gap-2 items-center">
                      <select value={pkg.ingredientId} onChange={(e) => updatePackaging(index, 'ingredientId', e.target.value)} className={inputClass}>
                        <option value="">Выберите упаковку</option>
                        {packagingIngredients.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                      <input type="number" step="0.0001" min="0" value={pkg.quantity} onChange={(e) => updatePackaging(index, 'quantity', e.target.value)} className={inputClass} placeholder="Кол-во" />
                      <select value={pkg.unit} onChange={(e) => updatePackaging(index, 'unit', e.target.value)} className={inputClass}>
                        {Object.entries(BASE_UNITS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removePackaging(index)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors justify-self-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">Создать версию</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
