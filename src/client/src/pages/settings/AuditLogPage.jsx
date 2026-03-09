import { useState, useEffect } from 'react';
import { ScrollText, Filter, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { getAuditLogs, getAuditLogEntityTypes } from '../../api/auditLog';
import { getBranches } from '../../api/branches';

const ACTION_LABELS = {
  Create: 'Создание',
  Update: 'Изменение',
  Delete: 'Удаление',
};

const ACTION_COLORS = {
  Create: 'text-[hsl(var(--success))]',
  Update: 'text-[hsl(var(--warning))]',
  Delete: 'text-[hsl(var(--destructive))]',
};

const ENTITY_LABELS = {
  Branch: 'Филиал',
  User: 'Пользователь',
  Recipe: 'Рецептура',
  RecipeVersion: 'Версия рецептуры',
  Ingredient: 'Ингредиент',
  ProductionBatch: 'Партия',
  IngredientReceipt: 'Приход сырья',
  IngredientWriteOff: 'Списание',
  ProductStock: 'Остаток продукции',
  Sale: 'Продажа',
  SaleItem: 'Позиция продажи',
  Payment: 'Оплата',
  Client: 'Клиент',
  Expense: 'Расход',
  Employee: 'Сотрудник',
  Transfer: 'Трансфер',
  Inventory: 'Инвентаризация',
  PayrollCalculation: 'Расчёт зарплаты',
  PriceList: 'Прайс-лист',
  ExchangeRate: 'Курс валюты',
  Supplier: 'Поставщик',
  SaleReturn: 'Возврат',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters
  const [branches, setBranches] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const pageSize = 50;

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [page]);

  async function loadFilters() {
    try {
      const [branchData, typeData] = await Promise.all([
        getBranches(),
        getAuditLogEntityTypes().catch(() => []),
      ]);
      setBranches(branchData.filter(b => b.status === 'Active'));
      setEntityTypes(typeData);
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  }

  async function loadLogs() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLogs({
        branchId: branchId || undefined,
        entityType: entityType || undefined,
        action: action || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        page,
        pageSize,
      });
      setLogs(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Не удалось загрузить журнал');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    setPage(1);
    loadLogs();
  }

  function handleReset() {
    setBranchId('');
    setEntityType('');
    setAction('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    // Load will trigger from page change or we do it manually
    setTimeout(() => loadLogs(), 0);
  }

  function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  const inputClass = "px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-sm";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Журнал событий</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Аудит всех действий в системе
            {totalCount > 0 && ` · ${totalCount} записей`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Филиал</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={inputClass + " min-w-[140px]"}>
              <option value="">Все</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Объект</label>
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className={inputClass + " min-w-[140px]"}>
              <option value="">Все</option>
              {entityTypes.map(t => (
                <option key={t} value={t}>{ENTITY_LABELS[t] || t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Действие</label>
            <select value={action} onChange={(e) => setAction(e.target.value)} className={inputClass + " min-w-[120px]"}>
              <option value="">Все</option>
              <option value="Create">Создание</option>
              <option value="Update">Изменение</option>
              <option value="Delete">Удаление</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">С</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">По</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
          </div>
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Filter className="w-4 h-4" />
            Применить
          </button>
          {(branchId || entityType || action || dateFrom || dateTo) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Дата/время</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Пользователь</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Действие</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Объект</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Филиал</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Загрузка...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <ScrollText className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Нет записей в журнале</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`${index !== logs.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''} hover:bg-[hsl(var(--muted))]/30 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                      {formatDateTime(log.actionTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                      {log.userLogin}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${ACTION_COLORS[log.action] || 'text-[hsl(var(--foreground))]'}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                      {ENTITY_LABELS[log.entityType] || log.entityType}
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] font-mono">
                      #{log.entityId}
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                      {log.branchName || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(log.oldValue || log.newValue) && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                          title="Подробнее"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Стр. {page} из {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

function DetailModal({ log, onClose }) {
  let oldData = null;
  let newData = null;

  try {
    if (log.oldValue) oldData = JSON.parse(log.oldValue);
  } catch { /* ignore */ }
  try {
    if (log.newValue) newData = JSON.parse(log.newValue);
  } catch { /* ignore */ }

  // Collect all keys
  const allKeys = [...new Set([
    ...(oldData ? Object.keys(oldData) : []),
    ...(newData ? Object.keys(newData) : []),
  ])];

  function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function formatValue(val) {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Да' : 'Нет';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Детали изменения
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              {ACTION_LABELS[log.action] || log.action} · {ENTITY_LABELS[log.entityType] || log.entityType} #{log.entityId} · {formatDateTime(log.actionTime)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Пользователь</p>
              <p className="text-sm text-[hsl(var(--foreground))] font-medium">{log.userLogin}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Филиал</p>
              <p className="text-sm text-[hsl(var(--foreground))] font-medium">{log.branchName || '—'}</p>
            </div>
          </div>

          {/* Changes table */}
          {allKeys.length > 0 ? (
            <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[hsl(var(--muted))]/50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">Поле</th>
                    {oldData && <th className="text-left px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">Было</th>}
                    {newData && <th className="text-left px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">Стало</th>}
                  </tr>
                </thead>
                <tbody>
                  {allKeys.map((key, i) => {
                    const oldVal = oldData?.[key];
                    const newVal = newData?.[key];
                    const changed = oldData && newData && JSON.stringify(oldVal) !== JSON.stringify(newVal);
                    return (
                      <tr key={key} className={i < allKeys.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                        <td className="px-3 py-2 text-sm text-[hsl(var(--foreground))] font-mono text-xs">{key}</td>
                        {oldData && (
                          <td className={`px-3 py-2 text-sm break-all ${changed ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {formatValue(oldVal)}
                          </td>
                        )}
                        {newData && (
                          <td className={`px-3 py-2 text-sm break-all ${changed ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {formatValue(newVal)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Нет данных об изменениях</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--border))]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
