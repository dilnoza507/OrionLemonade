import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Eye, Trash2, X, Play, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import { getInventories, getInventoryDetail, createInventory, startInventory, completeInventory, cancelInventory, deleteInventory } from '../api/inventories';
import { getBranches } from '../api/branches';

const statusColors = {
  'Черновик': 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  'В процессе': 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  'Завершена': 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  'Отменена': 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadInventories();
  }, [selectedBranch, selectedType, selectedStatus]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const branchesData = await getBranches();
      setBranches(branchesData.filter(b => b.status === 'Active'));
      await loadInventories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadInventories() {
    try {
      const data = await getInventories(
        selectedBranch || null,
        selectedType || null,
        selectedStatus || null
      );
      setInventories(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStart(id) {
    if (!confirm('Начать инвентаризацию? После начала позиции будут доступны для подсчёта.')) return;
    try {
      await startInventory(id);
      await loadInventories();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    if (!confirm('Отменить инвентаризацию?')) return;
    try {
      await cancelInventory(id);
      await loadInventories();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить инвентаризацию? Это действие нельзя отменить.')) return;
    try {
      await deleteInventory(id);
      await loadInventories();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(id) {
    try {
      const detail = await getInventoryDetail(id);
      setSelectedInventory(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOpenComplete(id) {
    try {
      const detail = await getInventoryDetail(id);
      setSelectedInventory(detail);
      setShowCompleteModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalInventories = inventories.length;
  const inProgress = inventories.filter(i => i.statusName === 'В процессе').length;
  const completed = inventories.filter(i => i.statusName === 'Завершена').length;
  const withDiscrepancy = inventories.filter(i => i.itemsWithDiscrepancy > 0).length;

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
              <p className={`${mutedClass} text-sm`}>Всего инвентаризаций</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalInventories}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>В процессе</p>
              <p className={`text-2xl font-bold ${textClass}`}>{inProgress}</p>
            </div>
            <Play className="w-8 h-8 text-[hsl(var(--warning))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Завершено</p>
              <p className={`text-2xl font-bold ${textClass}`}>{completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>С расхождениями</p>
              <p className={`text-2xl font-bold ${textClass}`}>{withDiscrepancy}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[hsl(var(--destructive))]" />
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
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          >
            <option value="">Все типы</option>
            <option value="RawMaterials">Сырьё и материалы</option>
            <option value="FinishedProducts">Готовая продукция</option>
          </select>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
          >
            <option value="">Все статусы</option>
            <option value="Draft">Черновик</option>
            <option value="InProgress">В процессе</option>
            <option value="Completed">Завершена</option>
            <option value="Cancelled">Отменена</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--primary))]/90"
        >
          <Plus className="w-4 h-4" />
          Новая инвентаризация
        </button>
      </div>

      {/* Inventories Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Номер</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Филиал</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Тип</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Статус</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Позиций</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Расхождения</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {inventories.length === 0 ? (
              <tr>
                <td colSpan={8} className={`p-8 text-center ${mutedClass}`}>
                  Нет инвентаризаций
                </td>
              </tr>
            ) : (
              inventories.map(inv => (
                <tr key={inv.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass} font-mono`}>{inv.inventoryNumber}</td>
                  <td className={`p-3 ${textClass}`}>{new Date(inv.inventoryDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass}`}>{inv.branchName}</td>
                  <td className={`p-3 ${textClass}`}>{inv.inventoryTypeName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[inv.statusName] || 'bg-[hsl(var(--muted))]'}`}>
                      {inv.statusName}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{inv.itemsCount}</td>
                  <td className={`p-3 text-right ${inv.itemsWithDiscrepancy > 0 ? 'text-[hsl(var(--destructive))] font-medium' : mutedClass}`}>
                    {inv.itemsWithDiscrepancy > 0 ? inv.itemsWithDiscrepancy : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetail(inv.id)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Детали"
                      >
                        <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                      {inv.statusName === 'Черновик' && (
                        <>
                          <button
                            onClick={() => handleStart(inv.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Начать"
                          >
                            <Play className="w-4 h-4 text-[hsl(var(--primary))]" />
                          </button>
                          <button
                            onClick={() => handleCancel(inv.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Отменить"
                          >
                            <XCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
                          </button>
                        </>
                      )}
                      {inv.statusName === 'В процессе' && (
                        <>
                          <button
                            onClick={() => handleOpenComplete(inv.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Завершить"
                          >
                            <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))]" />
                          </button>
                          <button
                            onClick={() => handleCancel(inv.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Отменить"
                          >
                            <XCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
                          </button>
                        </>
                      )}
                      {(inv.statusName === 'Черновик' || inv.statusName === 'Отменена') && (
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
                        </button>
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
        <CreateInventoryModal
          branches={branches}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadInventories();
          }}
          setError={setError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInventory && (
        <InventoryDetailModal
          inventory={selectedInventory}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInventory(null);
          }}
        />
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedInventory && (
        <CompleteInventoryModal
          inventory={selectedInventory}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedInventory(null);
          }}
          onSave={async () => {
            setShowCompleteModal(false);
            setSelectedInventory(null);
            await loadInventories();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateInventoryModal({ branches, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    branchId: branches.length > 0 ? branches[0].id.toString() : '',
    inventoryDate: new Date().toISOString().split('T')[0],
    inventoryType: 'RawMaterials',
    comment: ''
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createInventory({
        branchId: parseInt(form.branchId),
        inventoryDate: new Date(form.inventoryDate).toISOString(),
        inventoryType: form.inventoryType,
        comment: form.comment || null
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
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Новая инвентаризация</h2>
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
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата инвентаризации</label>
            <input
              type="date"
              value={form.inventoryDate}
              onChange={e => setForm({ ...form, inventoryDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Тип</label>
            <select
              value={form.inventoryType}
              onChange={e => setForm({ ...form, inventoryType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            >
              <option value="RawMaterials">Сырьё и материалы</option>
              <option value="FinishedProducts">Готовая продукция</option>
            </select>
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

          <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              При создании инвентаризации автоматически загружаются все позиции со склада филиала с их текущими остатками.
            </p>
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
              {saving ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InventoryDetailModal({ inventory, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-2xl max-h-[90vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Инвентаризация {inventory.inventoryNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата</p>
              <p className="text-[hsl(var(--foreground))]">{new Date(inventory.inventoryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
              <span className={`px-2 py-1 rounded text-xs ${statusColors[inventory.statusName] || ''}`}>
                {inventory.statusName}
              </span>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Филиал</p>
              <p className="text-[hsl(var(--foreground))]">{inventory.branchName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Тип</p>
              <p className="text-[hsl(var(--foreground))]">{inventory.inventoryTypeName}</p>
            </div>
            {inventory.startedAt && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Начата</p>
                <p className="text-[hsl(var(--foreground))]">{new Date(inventory.startedAt).toLocaleString()}</p>
              </div>
            )}
            {inventory.completedAt && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Завершена</p>
                <p className="text-[hsl(var(--foreground))]">{new Date(inventory.completedAt).toLocaleString()}</p>
              </div>
            )}
            {inventory.startedByUserLogin && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Начал</p>
                <p className="text-[hsl(var(--foreground))]">{inventory.startedByUserLogin}</p>
              </div>
            )}
            {inventory.completedByUserLogin && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Завершил</p>
                <p className="text-[hsl(var(--foreground))]">{inventory.completedByUserLogin}</p>
              </div>
            )}
          </div>

          {inventory.comment && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Комментарий</p>
              <p className="text-[hsl(var(--foreground))]">{inventory.comment}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Позиции ({inventory.items?.length || 0})</p>
            <div className="space-y-2 max-h-80 overflow-auto">
              {inventory.items?.map(item => (
                <div key={item.id} className={`p-3 rounded-lg ${
                  item.discrepancy && item.discrepancy !== 0
                    ? 'bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/30'
                    : 'bg-[hsl(var(--muted))]/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">{item.itemName}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.itemTypeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[hsl(var(--foreground))]">
                        Ожидалось: {item.expectedQuantity} {item.unit || ''}
                      </p>
                      {item.actualQuantity !== null && (
                        <p className={`text-sm ${item.discrepancy ? 'text-[hsl(var(--destructive))] font-medium' : 'text-[hsl(var(--muted-foreground))]'}`}>
                          Фактически: {item.actualQuantity} {item.unit || ''}
                          {item.discrepancy !== 0 && ` (${item.discrepancy > 0 ? '-' : '+'}${Math.abs(item.discrepancy)})`}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.notes && (
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{item.notes}</p>
                  )}
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

function CompleteInventoryModal({ inventory, onClose, onSave, setError }) {
  const [items, setItems] = useState(
    inventory.items?.map(i => ({
      itemId: i.itemId,
      itemName: i.itemName,
      expectedQuantity: i.expectedQuantity,
      actualQuantity: i.expectedQuantity,
      unit: i.unit,
      notes: ''
    })) || []
  );
  const [saving, setSaving] = useState(false);

  function updateItem(itemId, field, value) {
    setItems(items.map(i =>
      i.itemId === itemId ? { ...i, [field]: value } : i
    ));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await completeInventory(inventory.id, {
        items: items.map(i => ({
          itemId: i.itemId,
          actualQuantity: parseFloat(i.actualQuantity),
          notes: i.notes || null
        }))
      });
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const hasDiscrepancies = items.some(i => i.actualQuantity !== i.expectedQuantity);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-2xl max-h-[90vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Завершить инвентаризацию {inventory.inventoryNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
          <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Укажите фактическое количество для каждой позиции. При расхождениях остатки будут автоматически скорректированы.
            </p>
          </div>

          <div className="space-y-3">
            {items.map(item => {
              const discrepancy = item.expectedQuantity - item.actualQuantity;
              const hasDiscrepancy = discrepancy !== 0;
              return (
                <div key={item.itemId} className={`p-3 rounded-lg ${
                  hasDiscrepancy
                    ? 'bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30'
                    : 'bg-[hsl(var(--muted))]/30'
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-[hsl(var(--foreground))]">{item.itemName}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Ожидалось: {item.expectedQuantity} {item.unit || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.actualQuantity}
                        onChange={e => updateItem(item.itemId, 'actualQuantity', parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-center"
                      />
                      <span className="text-sm text-[hsl(var(--muted-foreground))] w-10">{item.unit || ''}</span>
                    </div>
                  </div>
                  {hasDiscrepancy && (
                    <p className={`text-sm font-medium ${discrepancy > 0 ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--primary))]'}`}>
                      {discrepancy > 0 ? `Недостача: ${discrepancy}` : `Излишек: ${Math.abs(discrepancy)}`}
                    </p>
                  )}
                  <input
                    type="text"
                    value={item.notes}
                    onChange={e => updateItem(item.itemId, 'notes', e.target.value)}
                    placeholder="Примечание..."
                    className="mt-2 w-full px-2 py-1 text-sm rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                </div>
              );
            })}
          </div>

          {hasDiscrepancies && (
            <div className="p-3 bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))] rounded-lg">
              <p className="text-sm text-[hsl(var(--warning))] font-medium">
                Обнаружены расхождения! При завершении остатки будут автоматически скорректированы.
              </p>
            </div>
          )}

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
              {saving ? 'Сохранение...' : 'Завершить инвентаризацию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
