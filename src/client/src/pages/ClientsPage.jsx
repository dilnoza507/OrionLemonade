import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, X, CheckCircle, XCircle, Phone, Mail, MapPin } from 'lucide-react';
import { getClients, createClient, updateClient, deleteClient } from '../api/clients';

const STATUSES = {
  Active: { label: 'Активен', color: 'success' },
  Inactive: { label: 'Неактивен', color: 'muted' },
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить клиентов');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingClient(null); setIsModalOpen(true); }
  function handleEdit(client) { setEditingClient(client); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить клиента?')) return;
    try {
      await deleteClient(id);
      await loadClients();
    } catch (err) {
      setError('Не удалось удалить клиента');
    }
  }

  async function handleSave(data) {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
      } else {
        await createClient(data);
      }
      setIsModalOpen(false);
      await loadClients();
    } catch (err) {
      setError('Не удалось сохранить клиента');
    }
  }

  const filteredClients = filter === 'all'
    ? clients
    : clients.filter(c => c.status === filter);

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    inactive: clients.filter(c => c.status === 'Inactive').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Клиенты</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Справочник клиентов, контакты и информация</p>
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
      ) : filteredClients.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет клиентов</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первого клиента</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить клиента
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const status = STATUSES[client.status] || { label: client.status, color: 'muted' };
            return (
              <div key={client.id} className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[hsl(var(--foreground))]">{client.name}</h3>
                    {client.contactPerson && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{client.contactPerson}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--${status.color}))]/10 text-[hsl(var(--${status.color}))]`}>
                    {client.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2">{client.notes}</p>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
                  <button onClick={() => handleEdit(client)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (<ClientModal client={editingClient} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function ClientModal({ client, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contactPerson: client?.contactPerson || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    notes: client?.notes || '',
    status: client?.status || 'Active',
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
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{client ? 'Редактировать клиента' : 'Новый клиент'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название / ФИО *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="ООО Рассвет" />
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
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="client@mail.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Адрес</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="г. Душанбе, ул. Мира, 15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Заметки</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
              rows="3"
              placeholder="Дополнительная информация о клиенте"
            />
          </div>
          {client && (
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
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{client ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
