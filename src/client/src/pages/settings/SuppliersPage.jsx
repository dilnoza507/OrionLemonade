import { useState, useEffect } from 'react';
import { Truck, Plus, Pencil, Trash2, X, CheckCircle, XCircle, Phone, Mail, MapPin } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/suppliers';

const STATUSES = {
  Active: { label: 'Активен', color: 'success' },
  Inactive: { label: 'Неактивен', color: 'muted' },
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadSuppliers(); }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить поставщиков');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingSupplier(null); setIsModalOpen(true); }
  function handleEdit(supplier) { setEditingSupplier(supplier); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить поставщика?')) return;
    try {
      await deleteSupplier(id);
      await loadSuppliers();
    } catch (err) {
      setError('Не удалось удалить поставщика');
    }
  }

  async function handleSave(data) {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
      } else {
        await createSupplier(data);
      }
      setIsModalOpen(false);
      await loadSuppliers();
    } catch (err) {
      setError('Не удалось сохранить поставщика');
    }
  }

  const filteredSuppliers = filter === 'all'
    ? suppliers
    : suppliers.filter(s => s.status === filter);

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'Active').length,
    inactive: suppliers.filter(s => s.status === 'Inactive').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Поставщики</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Справочник поставщиков сырья и материалов</p>
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
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Активных</p>
          <p className="text-2xl font-bold text-[hsl(var(--success))]">{stats.active}</p>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Неактивных</p>
          <p className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">{stats.inactive}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'all', label: 'Все' }, { key: 'Active', label: 'Активные' }, { key: 'Inactive', label: 'Неактивные' }].map(tab => (
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
      ) : filteredSuppliers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><Truck className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет поставщиков</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первого поставщика</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить поставщика
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const status = STATUSES[supplier.status] || { label: supplier.status, color: 'muted' };
            return (
              <div key={supplier.id} className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[hsl(var(--foreground))]">{supplier.name}</h3>
                    {supplier.contactPerson && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{supplier.contactPerson}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--${status.color}))]/10 text-[hsl(var(--${status.color}))]`}>
                    {supplier.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                      <Mail className="w-4 h-4" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{supplier.address}</span>
                    </div>
                  )}
                </div>

                {supplier.notes && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2">{supplier.notes}</p>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
                  <button onClick={() => handleEdit(supplier)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(supplier.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (<SupplierModal supplier={editingSupplier} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function SupplierModal({ supplier, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    notes: supplier?.notes || '',
    status: supplier?.status || 'Active',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: formData.name,
      contactPerson: formData.contactPerson || null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      notes: formData.notes || null,
      status: formData.status,
    });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{supplier ? 'Редактировать поставщика' : 'Новый поставщик'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="ООО Сахарный завод" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Контактное лицо</label>
            <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className={inputClass} placeholder="Иванов Иван" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Телефон</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+992 900 123456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="supplier@mail.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Адрес</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="г. Душанбе, ул. Промышленная, 10" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Заметки</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
              rows="3"
              placeholder="Дополнительная информация о поставщике"
            />
          </div>
          {supplier && (
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
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{supplier ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
