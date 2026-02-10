import { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, Eye, Trash2, X, Package, Send, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import { getTransfers, getTransferDetail, createTransfer, sendTransfer, receiveTransfer, cancelTransfer, deleteTransfer } from '../api/transfers';
import { getBranches } from '../api/branches';
import { getIngredients } from '../api/ingredients';
import { getRecipes } from '../api/recipes';

const statusColors = {
  'Создан': 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  'В пути': 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  'Получен': 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
  'Отменён': 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
};

const cardClass = "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]";
const textClass = "text-[hsl(var(--foreground))]";
const mutedClass = "text-[hsl(var(--muted-foreground))]";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [selectedBranch, selectedType, selectedStatus]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const branchesData = await getBranches();
      setBranches(branchesData.filter(b => b.status === 'Active'));
      await loadTransfers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransfers() {
    try {
      const data = await getTransfers(
        selectedBranch || null,
        selectedType || null,
        selectedStatus || null
      );
      setTransfers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSend(id) {
    if (!confirm('Отправить трансфер? Товары будут списаны со склада отправителя.')) return;
    try {
      await sendTransfer(id);
      await loadTransfers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    if (!confirm('Отменить трансфер?')) return;
    try {
      await cancelTransfer(id);
      await loadTransfers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить трансфер? Это действие нельзя отменить.')) return;
    try {
      await deleteTransfer(id);
      await loadTransfers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetail(id) {
    try {
      const detail = await getTransferDetail(id);
      setSelectedTransfer(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOpenReceive(id) {
    try {
      const detail = await getTransferDetail(id);
      setSelectedTransfer(detail);
      setShowReceiveModal(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalTransfers = transfers.length;
  const inTransit = transfers.filter(t => t.statusName === 'В пути').length;
  const received = transfers.filter(t => t.statusName === 'Получен').length;

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
              <p className={`${mutedClass} text-sm`}>Всего трансферов</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalTransfers}</p>
            </div>
            <ArrowLeftRight className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>В пути</p>
              <p className={`text-2xl font-bold ${textClass}`}>{inTransit}</p>
            </div>
            <Truck className="w-8 h-8 text-[hsl(var(--warning))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Получено</p>
              <p className={`text-2xl font-bold ${textClass}`}>{received}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mutedClass} text-sm`}>Ожидают отправки</p>
              <p className={`text-2xl font-bold ${textClass}`}>
                {transfers.filter(t => t.statusName === 'Создан').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
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
            <option value="Created">Создан</option>
            <option value="InTransit">В пути</option>
            <option value="Received">Получен</option>
            <option value="Cancelled">Отменён</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg flex items-center gap-2 hover:bg-[hsl(var(--primary))]/90"
        >
          <Plus className="w-4 h-4" />
          Новый трансфер
        </button>
      </div>

      {/* Transfers Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[hsl(var(--card))]">
            <tr className="border-b border-[hsl(var(--border))]">
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Номер</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Дата</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Тип</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Отправитель</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Получатель</th>
              <th className={`text-left p-3 ${mutedClass} font-medium`}>Статус</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Позиций</th>
              <th className={`text-right p-3 ${mutedClass} font-medium`}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={8} className={`p-8 text-center ${mutedClass}`}>
                  Нет трансферов
                </td>
              </tr>
            ) : (
              transfers.map(t => (
                <tr key={t.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50">
                  <td className={`p-3 ${textClass} font-mono`}>{t.transferNumber}</td>
                  <td className={`p-3 ${textClass}`}>{new Date(t.createdDate).toLocaleDateString()}</td>
                  <td className={`p-3 ${textClass}`}>{t.transferTypeName}</td>
                  <td className={`p-3 ${textClass}`}>{t.senderBranchName}</td>
                  <td className={`p-3 ${textClass}`}>{t.receiverBranchName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[t.statusName] || 'bg-[hsl(var(--muted))]'}`}>
                      {t.statusName}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${textClass}`}>{t.itemsCount}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetail(t.id)}
                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                        title="Детали"
                      >
                        <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                      {t.statusName === 'Создан' && (
                        <>
                          <button
                            onClick={() => handleSend(t.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Отправить"
                          >
                            <Send className="w-4 h-4 text-[hsl(var(--primary))]" />
                          </button>
                          <button
                            onClick={() => handleCancel(t.id)}
                            className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                            title="Отменить"
                          >
                            <XCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
                          </button>
                        </>
                      )}
                      {t.statusName === 'В пути' && (
                        <button
                          onClick={() => handleOpenReceive(t.id)}
                          className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
                          title="Принять"
                        >
                          <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))]" />
                        </button>
                      )}
                      {(t.statusName === 'Создан' || t.statusName === 'Отменён') && (
                        <button
                          onClick={() => handleDelete(t.id)}
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
        <CreateTransferModal
          branches={branches}
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadTransfers();
          }}
          setError={setError}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTransfer && (
        <TransferDetailModal
          transfer={selectedTransfer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransfer(null);
          }}
        />
      )}

      {/* Receive Modal */}
      {showReceiveModal && selectedTransfer && (
        <ReceiveTransferModal
          transfer={selectedTransfer}
          onClose={() => {
            setShowReceiveModal(false);
            setSelectedTransfer(null);
          }}
          onSave={async () => {
            setShowReceiveModal(false);
            setSelectedTransfer(null);
            await loadTransfers();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateTransferModal({ branches, onClose, onSave, setError }) {
  const [form, setForm] = useState({
    senderBranchId: branches.length > 0 ? branches[0].id.toString() : '',
    receiverBranchId: branches.length > 1 ? branches[1].id.toString() : '',
    transferType: 'RawMaterials',
    comment: '',
    items: []
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailableItems();
  }, [form.transferType]);

  async function loadAvailableItems() {
    setLoadingItems(true);
    try {
      if (form.transferType === 'RawMaterials') {
        const data = await getIngredients();
        setAvailableItems(data.filter(i => i.status === 'Active'));
      } else {
        const data = await getRecipes();
        setAvailableItems(data.filter(r => r.status === 'Active'));
      }
      setForm(f => ({ ...f, items: [] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingItems(false);
    }
  }

  function addItem(item) {
    if (form.items.find(i => i.itemId === item.id)) return;
    setForm(f => ({
      ...f,
      items: [...f.items, {
        itemId: item.id,
        itemName: item.name || item.productName,
        quantitySent: 1,
        transferPriceUsd: 0
      }]
    }));
  }

  function removeItem(itemId) {
    setForm(f => ({
      ...f,
      items: f.items.filter(i => i.itemId !== itemId)
    }));
  }

  function updateItem(itemId, field, value) {
    setForm(f => ({
      ...f,
      items: f.items.map(i => i.itemId === itemId ? { ...i, [field]: value } : i)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.senderBranchId === form.receiverBranchId) {
      setError('Отправитель и получатель не могут быть одним филиалом');
      return;
    }
    if (form.items.length === 0) {
      setError('Добавьте хотя бы одну позицию');
      return;
    }

    setSaving(true);
    try {
      await createTransfer({
        senderBranchId: parseInt(form.senderBranchId),
        receiverBranchId: parseInt(form.receiverBranchId),
        transferType: form.transferType,
        comment: form.comment || null,
        items: form.items.map(i => ({
          itemId: i.itemId,
          quantitySent: parseFloat(i.quantitySent),
          transferPriceUsd: parseFloat(i.transferPriceUsd) || 0
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
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-3xl max-h-[90vh] border border-[hsl(var(--border))] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Новый трансфер</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Отправитель</label>
              <select
                value={form.senderBranchId}
                onChange={e => setForm({ ...form, senderBranchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Получатель</label>
              <select
                value={form.receiverBranchId}
                onChange={e => setForm({ ...form, receiverBranchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                required
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Тип трансфера</label>
            <select
              value={form.transferType}
              onChange={e => setForm({ ...form, transferType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            >
              <option value="RawMaterials">Сырьё и материалы</option>
              <option value="FinishedProducts">Готовая продукция</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
              Добавить позиции ({form.transferType === 'RawMaterials' ? 'Ингредиенты' : 'Продукция'})
            </label>
            {loadingItems ? (
              <p className="text-[hsl(var(--muted-foreground))]">Загрузка...</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-auto p-2 bg-[hsl(var(--muted))]/30 rounded-lg">
                {availableItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItem(item)}
                    disabled={form.items.find(i => i.itemId === item.id)}
                    className={`px-2 py-1 text-sm rounded ${
                      form.items.find(i => i.itemId === item.id)
                        ? 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]'
                        : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                    } border border-[hsl(var(--border))]`}
                  >
                    {item.name || item.productName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {form.items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Позиции трансфера</label>
              <div className="space-y-2">
                {form.items.map(item => (
                  <div key={item.itemId} className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-[hsl(var(--foreground))]">{item.itemName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.quantitySent}
                        onChange={e => updateItem(item.itemId, 'quantitySent', e.target.value)}
                        className="w-24 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-center"
                        placeholder="Кол-во"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.transferPriceUsd}
                        onChange={e => updateItem(item.itemId, 'transferPriceUsd', e.target.value)}
                        className="w-24 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-center"
                        placeholder="Цена $"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.itemId)}
                        className="p-1 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Комментарий</label>
            <textarea
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
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
              {saving ? 'Создание...' : 'Создать трансфер'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransferDetailModal({ transfer, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Трансфер {transfer.transferNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата создания</p>
              <p className="text-[hsl(var(--foreground))]">{new Date(transfer.createdDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Статус</p>
              <span className={`px-2 py-1 rounded text-xs ${statusColors[transfer.statusName] || ''}`}>
                {transfer.statusName}
              </span>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Отправитель</p>
              <p className="text-[hsl(var(--foreground))]">{transfer.senderBranchName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Получатель</p>
              <p className="text-[hsl(var(--foreground))]">{transfer.receiverBranchName}</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Тип</p>
              <p className="text-[hsl(var(--foreground))]">{transfer.transferTypeName}</p>
            </div>
            {transfer.sentDate && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата отправки</p>
                <p className="text-[hsl(var(--foreground))]">{new Date(transfer.sentDate).toLocaleDateString()}</p>
              </div>
            )}
            {transfer.receivedDate && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Дата получения</p>
                <p className="text-[hsl(var(--foreground))]">{new Date(transfer.receivedDate).toLocaleDateString()}</p>
              </div>
            )}
            {transfer.sentByUserLogin && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Отправил</p>
                <p className="text-[hsl(var(--foreground))]">{transfer.sentByUserLogin}</p>
              </div>
            )}
            {transfer.receivedByUserLogin && (
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Принял</p>
                <p className="text-[hsl(var(--foreground))]">{transfer.receivedByUserLogin}</p>
              </div>
            )}
          </div>

          {transfer.comment && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Комментарий</p>
              <p className="text-[hsl(var(--foreground))]">{transfer.comment}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Позиции</p>
            <div className="space-y-2">
              {transfer.items?.map(item => (
                <div key={item.id} className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">{item.itemName}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.itemTypeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[hsl(var(--foreground))]">
                        Отправлено: {item.quantitySent} {item.unit || ''}
                      </p>
                      {item.quantityReceived !== null && (
                        <p className={`text-sm ${item.discrepancy ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                          Получено: {item.quantityReceived} {item.unit || ''}
                          {item.discrepancy > 0 && ` (недостача: ${item.discrepancy})`}
                        </p>
                      )}
                      {item.transferPriceUsd > 0 && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          ${item.transferPriceUsd.toFixed(2)}
                        </p>
                      )}
                    </div>
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

function ReceiveTransferModal({ transfer, onClose, onSave, setError }) {
  const [items, setItems] = useState(
    transfer.items?.map(i => ({
      itemId: i.itemId,
      itemName: i.itemName,
      quantitySent: i.quantitySent,
      quantityReceived: i.quantitySent,
      unit: i.unit
    })) || []
  );
  const [saving, setSaving] = useState(false);

  function updateQuantity(itemId, quantity) {
    setItems(items.map(i =>
      i.itemId === itemId
        ? { ...i, quantityReceived: Math.min(Math.max(0, quantity), i.quantitySent) }
        : i
    ));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await receiveTransfer(transfer.id, {
        items: items.map(i => ({
          itemId: i.itemId,
          quantityReceived: parseFloat(i.quantityReceived)
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
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Принять трансфер {transfer.transferNumber}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Отправитель</p>
            <p className="font-medium text-[hsl(var(--foreground))]">{transfer.senderBranchName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Укажите фактически полученное количество</p>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.itemId} className="p-3 bg-[hsl(var(--muted))]/30 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-[hsl(var(--foreground))]">{item.itemName}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Отправлено: {item.quantitySent} {item.unit || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={item.quantitySent}
                      value={item.quantityReceived}
                      onChange={e => updateQuantity(item.itemId, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-center"
                    />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.unit || ''}</span>
                  </div>
                </div>
              ))}
            </div>
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
              {saving ? 'Сохранение...' : 'Принять трансфер'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
