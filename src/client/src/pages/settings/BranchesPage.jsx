import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, X, MapPin, Phone } from 'lucide-react';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../api/branches';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  useEffect(() => { loadBranches(); }, []);

  async function loadBranches() {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить филиалы');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingBranch(null); setIsModalOpen(true); }
  function handleEdit(branch) { setEditingBranch(branch); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить филиал?')) return;
    try { await deleteBranch(id); await loadBranches(); }
    catch (err) { setError('Не удалось удалить филиал'); }
  }

  async function handleSave(data) {
    try {
      if (editingBranch) { await updateBranch(editingBranch.id, data); }
      else { await createBranch(data); }
      setIsModalOpen(false);
      await loadBranches();
    } catch (err) { setError('Не удалось сохранить филиал'); }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Филиалы</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Управление филиалами (цехами) компании</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить
        </button>
      </div>

      {error && (<div className="mb-4 p-3 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] rounded-lg text-sm">{error}</div>)}

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[hsl(var(--muted-foreground))]">Загрузка...</div></div>
      ) : branches.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><Building2 className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет филиалов</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первый филиал для начала работы</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить филиал
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (<BranchCard key={branch.id} branch={branch} onEdit={() => handleEdit(branch)} onDelete={() => handleDelete(branch.id)} />))}
        </div>
      )}

      {isModalOpen && (<BranchModal branch={editingBranch} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function BranchCard({ branch, onEdit, onDelete }) {
  const isActive = branch.status === 'Active';
  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-[hsl(var(--primary))]" /></div>
          <div>
            <h3 className="font-semibold text-[hsl(var(--foreground))]">{branch.name}</h3>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{branch.code}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isActive ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'}`}>
          {isActive ? 'Активен' : 'Закрыт'}
        </span>
      </div>
      {(branch.city || branch.address) && (<div className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))] mb-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{[branch.city, branch.address].filter(Boolean).join(', ')}</span></div>)}
      {branch.phone && (<div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] mb-3"><Phone className="w-4 h-4" /><span>{branch.phone}</span></div>)}
      <div className="flex gap-2 pt-3 border-t border-[hsl(var(--border))]">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors"><Pencil className="w-4 h-4" />Изменить</button>
        <button onClick={onDelete} className="flex items-center justify-center px-3 py-2 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 rounded-lg hover:bg-[hsl(var(--destructive))]/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function BranchModal({ branch, onSave, onClose }) {
  const [formData, setFormData] = useState({ name: branch?.name || '', code: branch?.code || '', city: branch?.city || '', address: branch?.address || '', phone: branch?.phone || '', status: branch?.status || 'Active' });
  function handleSubmit(e) { e.preventDefault(); onSave(formData); }
  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{branch ? 'Редактировать филиал' : 'Новый филиал'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div><label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Название *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Цех Душанбе" /></div>
          <div><label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Код *</label><input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className={inputClass + " font-mono"} placeholder="DSH" maxLength={10} /></div>
          <div><label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Город</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} placeholder="Душанбе" /></div>
          <div><label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Адрес</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="ул. Рудаки, 123" /></div>
          <div><label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Телефон</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+992 XX XXX XXXX" /></div>
          {branch && (<div><label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Статус</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}><option value="Active">Активен</option><option value="Closed">Закрыт</option></select></div>)}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded-lg hover:bg-[hsl(var(--muted))]/80 transition-colors font-medium">Отмена</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{branch ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
