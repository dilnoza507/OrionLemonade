import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';

const ROLES = {
  SuperAdmin: { label: 'Супер Админ', color: 'destructive' },
  Director: { label: 'Директор', color: 'primary' },
  Accountant: { label: 'Бухгалтер', color: 'success' },
  Manager: { label: 'Менеджер', color: 'warning' },
  Storekeeper: { label: 'Кладовщик', color: 'muted' },
};

const SCOPES = {
  AllBranches: 'Все филиалы',
  OwnBranches: 'Свои филиалы',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingUser(null); setIsModalOpen(true); }
  function handleEdit(user) { setEditingUser(user); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить пользователя?')) return;
    try { await deleteUser(id); await loadUsers(); }
    catch (err) { setError('Не удалось удалить пользователя'); }
  }

  async function handleSave(data) {
    try {
      if (editingUser) { await updateUser(editingUser.id, data); }
      else { await createUser(data); }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) { setError('Не удалось сохранить пользователя'); }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Пользователи</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Управление учётными записями, роли и права доступа</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить
        </button>
      </div>

      {error && (<div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">{error}</div>)}

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[hsl(var(--muted-foreground))]">Загрузка...</div></div>
      ) : users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет пользователей</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первого пользователя</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить пользователя
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (<UserCard key={user.id} user={user} onEdit={() => handleEdit(user)} onDelete={() => handleDelete(user.id)} />))}
        </div>
      )}

      {isModalOpen && (<UserModal user={editingUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function UserCard({ user, onEdit, onDelete }) {
  const role = ROLES[user.role] || { label: user.role, color: 'muted' };
  const isBlocked = user.isBlocked;

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBlocked ? 'bg-[hsl(var(--destructive))]/10' : 'bg-[hsl(var(--primary))]/10'}`}>
            {isBlocked ? <ShieldAlert className="w-5 h-5 text-[hsl(var(--destructive))]" /> : <ShieldCheck className="w-5 h-5 text-[hsl(var(--primary))]" />}
          </div>
          <div>
            <h3 className="font-semibold text-[hsl(var(--foreground))]">{user.login}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-[hsl(var(--${role.color}))]/10 text-[hsl(var(--${role.color}))]`}>
              {role.label}
            </span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isBlocked ? 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'}`}>
          {isBlocked ? 'Заблокирован' : 'Активен'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] mb-3">
        <Shield className="w-4 h-4" />
        <span>{SCOPES[user.scope] || user.scope}</span>
      </div>
      {user.lastLogin && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
          Последний вход: {new Date(user.lastLogin).toLocaleString('ru-RU')}
        </div>
      )}
      <div className="flex gap-2 pt-3 border-t border-[hsl(var(--border))]">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors"><Pencil className="w-4 h-4" />Изменить</button>
        <button onClick={onDelete} className="flex items-center justify-center px-3 py-2 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 rounded-lg hover:bg-[hsl(var(--destructive))]/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function UserModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    login: user?.login || '',
    password: '',
    role: user?.role || 'Manager',
    scope: user?.scope || 'OwnBranches',
    isBlocked: user?.isBlocked || false,
  });

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...formData };
    if (user && !data.password) {
      delete data.password;
    }
    onSave(data);
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{user ? 'Редактировать пользователя' : 'Новый пользователь'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Логин *</label>
            <input type="text" required value={formData.login} onChange={(e) => setFormData({ ...formData, login: e.target.value })} className={inputClass} placeholder="username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">{user ? 'Новый пароль' : 'Пароль *'}</label>
            <input type="password" required={!user} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder={user ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Роль *</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass}>
              {Object.entries(ROLES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Область доступа *</label>
            <select value={formData.scope} onChange={(e) => setFormData({ ...formData, scope: e.target.value })} className={inputClass}>
              {Object.entries(SCOPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isBlocked" checked={formData.isBlocked} onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })} className="w-4 h-4 rounded border-[hsl(var(--border))]" />
              <label htmlFor="isBlocked" className="text-sm text-[hsl(var(--foreground))]">Заблокирован</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{user ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
