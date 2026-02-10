import { useState, useEffect } from 'react';
import { Factory, Plus, Play, CheckCircle, XCircle, Clock, Trash2, X, Eye } from 'lucide-react';
import { getBatches, createBatch, deleteBatch, startBatch, completeBatch, cancelBatch, getProductionSummary, getBatchDetail } from '../api/production';
import { getRecipes, getRecipeDetail } from '../api/recipes';
import { getBranches } from '../api/branches';

const unitLabels = { Kg: 'кг', L: 'л', Pcs: 'шт' };
const statusLabels = { Planned: 'Запланировано', InProgress: 'В процессе', Completed: 'Завершено', Cancelled: 'Отменено' };
const statusColors = {
  Planned: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  InProgress: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  Completed: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
  Cancelled: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function ProductionPage() {
  const [batches, setBatches] = useState([]);
  const [summary, setSummary] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadBatches();
  }, [selectedBranch, statusFilter]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [recipesData, branchesData, summaryData] = await Promise.all([
        getRecipes(),
        getBranches(),
        getProductionSummary()
      ]);
      setRecipes(recipesData.filter(r => r.status === 'Active'));
      setBranches(branchesData.filter(b => b.status === 'Active'));
      setSummary(summaryData);
      await loadBatches();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadBatches() {
    try {
      const data = await getBatches(selectedBranch || null);
      let filtered = data;
      if (statusFilter) {
        filtered = data.filter(b => b.status === statusFilter);
      }
      setBatches(filtered);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить партию?')) return;
    try {
      await deleteBatch(id);
      await loadBatches();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStart(batch) {
    if (!confirm(`Начать производство партии ${batch.batchNumber}?`)) return;
    try {
      await startBatch(batch.id, { ingredientConsumptions: [] });
      await loadBatches();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    if (!confirm('Отменить партию?')) return;
    try {
      await cancelBatch(id);
      await loadBatches();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(batch) {
    try {
      const detail = await getBatchDetail(batch.id);
      setSelectedBatch(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOpenComplete(batch) {
    try {
      const detail = await getBatchDetail(batch.id);
      setSelectedBatch(detail);
      setShowCompleteModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalBatches = summary.reduce((sum, s) => sum + s.totalBatches, 0);
  const plannedBatches = summary.reduce((sum, s) => sum + s.plannedBatches, 0);
  const inProgressBatches = summary.reduce((sum, s) => sum + s.inProgressBatches, 0);
  const completedBatches = summary.reduce((sum, s) => sum + s.completedBatches, 0);

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
              <p className={`${mutedClass} text-sm`}>Всего партий</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalBatches}</p>
            </div>
            <Factory className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Запланировано</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">{plannedBatches}</p>
            </div>
            <Clock className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>В процессе</p>
              <p className="text-2xl font-bold text-[hsl(var(--warning))]">{inProgressBatches}</p>
            </div>
            <Play className="w-8 h-8 text-[hsl(var(--warning))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Завершено</p>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">{completedBatches}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[hsl(var(--success))]" />
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
        <div className="flex gap-2">
          {[{ key: '', label: 'Все' }, { key: 'Planned', label: 'Запланировано' }, { key: 'InProgress', label: 'В процессе' }, { key: 'Completed', label: 'Завершено' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.key
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
              }`}
            >
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Новая партия
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <table className="w-full">
          <thead className="bg-[hsl(var(--muted))]/50">
            <tr>
              <th className={`text-left ${mutedClass} font-medium p-4`}>Номер</th>
              <th className={`text-left ${mutedClass} font-medium p-4`}>Рецептура</th>
              <th className={`text-left ${mutedClass} font-medium p-4`}>Филиал</th>
              <th className={`text-left ${mutedClass} font-medium p-4`}>Дата</th>
              <th className={`text-right ${mutedClass} font-medium p-4`}>План</th>
              <th className={`text-right ${mutedClass} font-medium p-4`}>Факт</th>
              <th className={`text-left ${mutedClass} font-medium p-4`}>Статус</th>
              <th className={`text-center ${mutedClass} font-medium p-4`}>Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {batches.map(batch => (
              <tr key={batch.id} className="hover:bg-[hsl(var(--muted))]/30">
                <td className={`p-4 ${textClass} font-mono`}>{batch.batchNumber}</td>
                <td className={`p-4 ${textClass}`}>
                  <div>
                    <span>{batch.recipeName}</span>
                    <span className={`${mutedClass} text-xs ml-2`}>v{batch.recipeVersionNumber}</span>
                  </div>
                </td>
                <td className={`p-4 ${mutedClass}`}>{batch.branchName}</td>
                <td className={`p-4 ${textClass}`}>{new Date(batch.plannedDate).toLocaleDateString('ru-RU')}</td>
                <td className={`p-4 text-right ${textClass}`}>{batch.plannedQuantity} {unitLabels[batch.outputUnit] || batch.outputUnit}</td>
                <td className={`p-4 text-right ${batch.actualQuantity > 0 ? 'text-[hsl(var(--success))]' : mutedClass}`}>
                  {batch.actualQuantity > 0 ? `${batch.actualQuantity} ${unitLabels[batch.outputUnit] || batch.outputUnit}` : '-'}
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[batch.status]}`}>
                    {statusLabels[batch.status] || batch.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleViewDetail(batch)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded" title="Детали">
                      <Eye className="w-4 h-4" />
                    </button>
                    {batch.status === 'Planned' && (
                      <>
                        <button onClick={() => handleStart(batch)} className="p-2 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10 rounded" title="Начать">
                          <Play className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(batch.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded" title="Удалить">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {batch.status === 'InProgress' && (
                      <>
                        <button onClick={() => handleOpenComplete(batch)} className="p-2 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10 rounded" title="Завершить">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleCancel(batch.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded" title="Отменить">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td colSpan={8} className={`p-8 text-center ${mutedClass}`}>Нет производственных партий</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBatchModal
          recipes={recipes}
          branches={branches}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadBatches();
            await loadInitialData();
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBatch && (
        <BatchDetailModal
          batch={selectedBatch}
          onClose={() => { setShowDetailModal(false); setSelectedBatch(null); }}
        />
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedBatch && (
        <CompleteBatchModal
          batch={selectedBatch}
          onClose={() => { setShowCompleteModal(false); setSelectedBatch(null); }}
          onSave={async () => {
            setShowCompleteModal(false);
            setSelectedBatch(null);
            await loadBatches();
            await loadInitialData();
          }}
        />
      )}
    </div>
  );
}

function CreateBatchModal({ recipes, branches, onClose, onSave }) {
  const [form, setForm] = useState({
    recipeId: '',
    recipeVersionId: '',
    branchId: '',
    plannedQuantity: '',
    outputUnit: 'L',
    plannedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (form.recipeId) {
      loadRecipeDetail(form.recipeId);
    } else {
      setRecipeDetail(null);
      setForm(f => ({ ...f, recipeVersionId: '', outputUnit: 'L' }));
    }
  }, [form.recipeId]);

  async function loadRecipeDetail(recipeId) {
    try {
      const detail = await getRecipeDetail(recipeId);
      setRecipeDetail(detail);
      if (detail.activeVersion) {
        setForm(f => ({
          ...f,
          recipeVersionId: detail.activeVersion.id.toString(),
          outputUnit: detail.outputUnit
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.branchId || !form.recipeId || !form.recipeVersionId || !form.plannedQuantity) {
      setError('Заполните обязательные поля');
      return;
    }
    setLoading(true);
    try {
      await createBatch({
        recipeId: parseInt(form.recipeId),
        recipeVersionId: parseInt(form.recipeVersionId),
        branchId: parseInt(form.branchId),
        plannedQuantity: parseFloat(form.plannedQuantity),
        outputUnit: form.outputUnit,
        plannedDate: new Date(form.plannedDate).toISOString(),
        notes: form.notes || null
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
      <div className="bg-[hsl(var(--card))] rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Новая производственная партия</h2>
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
              <input type="date" value={form.plannedDate} onChange={e => setForm({ ...form, plannedDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Рецептура *</label>
            <select value={form.recipeId} onChange={e => setForm({ ...form, recipeId: e.target.value })} className={inputClass}>
              <option value="">Выберите рецептуру</option>
              {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.productName})</option>)}
            </select>
          </div>

          {recipeDetail && recipeDetail.versions && recipeDetail.versions.length > 0 && (
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Версия рецептуры *</label>
              <select value={form.recipeVersionId} onChange={e => setForm({ ...form, recipeVersionId: e.target.value })} className={inputClass}>
                {recipeDetail.versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNumber} {v.isActive ? '(активная)' : ''} {v.notes ? `- ${v.notes}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Плановое количество *</label>
              <input type="number" step="0.01" min="0.01" value={form.plannedQuantity} onChange={e => setForm({ ...form, plannedQuantity: e.target.value })} className={inputClass} placeholder="100" />
            </div>
            <div>
              <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Ед. изм.</label>
              <select value={form.outputUnit} onChange={e => setForm({ ...form, outputUnit: e.target.value })} className={inputClass}>
                <option value="L">л</option>
                <option value="Kg">кг</option>
                <option value="Pcs">шт</option>
              </select>
            </div>
          </div>

          {recipeDetail && (
            <div className="bg-[hsl(var(--muted))]/30 rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Выход по рецептуре: <span className="text-[hsl(var(--foreground))] font-medium">{recipeDetail.outputVolume} {unitLabels[recipeDetail.outputUnit] || recipeDetail.outputUnit}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Примечание</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Отмена</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Создание...' : 'Создать партию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BatchDetailModal({ batch, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Партия {batch.batchNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Рецептура</p>
              <p className="text-[hsl(var(--foreground))] font-medium">{batch.recipeName} v{batch.recipeVersionNumber}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Филиал</p>
              <p className="text-[hsl(var(--foreground))] font-medium">{batch.branchName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Плановая дата</p>
              <p className="text-[hsl(var(--foreground))] font-medium">{new Date(batch.plannedDate).toLocaleDateString('ru-RU')}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[batch.status]}`}>{statusLabels[batch.status]}</span>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">План</p>
              <p className="text-[hsl(var(--foreground))] font-medium">{batch.plannedQuantity} {unitLabels[batch.outputUnit]}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Факт</p>
              <p className={`font-medium ${batch.actualQuantity > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {batch.actualQuantity > 0 ? `${batch.actualQuantity} ${unitLabels[batch.outputUnit]}` : '-'}
              </p>
            </div>
          </div>

          {batch.notes && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Примечание</p>
              <p className="text-[hsl(var(--foreground))]">{batch.notes}</p>
            </div>
          )}

          {batch.ingredientConsumptions && batch.ingredientConsumptions.length > 0 && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Расход ингредиентов</p>
              <div className="bg-[hsl(var(--muted))]/30 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left p-2 text-[hsl(var(--muted-foreground))]">Ингредиент</th>
                      <th className="text-right p-2 text-[hsl(var(--muted-foreground))]">План</th>
                      <th className="text-right p-2 text-[hsl(var(--muted-foreground))]">Факт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.ingredientConsumptions.map(c => (
                      <tr key={c.id} className="border-b border-[hsl(var(--border))] last:border-0">
                        <td className="p-2 text-[hsl(var(--foreground))]">{c.ingredientName}</td>
                        <td className="p-2 text-right text-[hsl(var(--foreground))]">{c.plannedQuantity} {unitLabels[c.unit]}</td>
                        <td className={`p-2 text-right ${c.actualQuantity > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                          {c.actualQuantity > 0 ? `${c.actualQuantity} ${unitLabels[c.unit]}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button onClick={onClose} className="px-6 py-2 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 text-[hsl(var(--foreground))] rounded-lg font-medium">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteBatchModal({ batch, onClose, onSave }) {
  const [actualQuantity, setActualQuantity] = useState(batch.plannedQuantity.toString());
  const [consumptions, setConsumptions] = useState(
    batch.ingredientConsumptions?.map(c => ({
      ingredientId: c.ingredientId,
      plannedQuantity: c.plannedQuantity,
      actualQuantity: c.plannedQuantity.toString(),
      unit: c.unit
    })) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function updateConsumption(ingredientId, value) {
    setConsumptions(prev => prev.map(c =>
      c.ingredientId === ingredientId ? { ...c, actualQuantity: value } : c
    ));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await completeBatch(batch.id, {
        actualQuantity: parseFloat(actualQuantity),
        ingredientConsumptions: consumptions.map(c => ({
          ingredientId: c.ingredientId,
          plannedQuantity: c.plannedQuantity,
          actualQuantity: parseFloat(c.actualQuantity),
          unit: c.unit
        }))
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
      <div className="bg-[hsl(var(--card))] rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Завершить партию {batch.batchNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-lg p-3 mb-4 text-[hsl(var(--destructive))] text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[hsl(var(--muted-foreground))] text-sm mb-1">Фактический выпуск ({unitLabels[batch.outputUnit]})</label>
            <input
              type="number"
              step="0.01"
              value={actualQuantity}
              onChange={e => setActualQuantity(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">План: {batch.plannedQuantity} {unitLabels[batch.outputUnit]}</p>
          </div>

          {consumptions.length > 0 && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Фактический расход ингредиентов</p>
              <div className="space-y-2">
                {batch.ingredientConsumptions?.map(c => {
                  const cons = consumptions.find(x => x.ingredientId === c.ingredientId);
                  return (
                    <div key={c.id} className="flex items-center gap-4 bg-[hsl(var(--muted))]/30 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="text-sm text-[hsl(var(--foreground))]">{c.ingredientName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">План: {c.plannedQuantity} {unitLabels[c.unit]}</p>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          value={cons?.actualQuantity || ''}
                          onChange={e => updateConsumption(c.ingredientId, e.target.value)}
                          className={`${inputClass} text-right`}
                        />
                      </div>
                      <span className="text-sm text-[hsl(var(--muted-foreground))] w-8">{unitLabels[c.unit]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Отмена</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[hsl(var(--success))] hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Сохранение...' : 'Завершить производство'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
