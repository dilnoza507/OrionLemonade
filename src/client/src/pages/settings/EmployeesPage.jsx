import { useState, useEffect } from 'react';
import { UserCog, Plus, Pencil, Trash2, X, CheckCircle, Clock, XCircle, Phone, Building2, Briefcase } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../api/employees';
import { getBranches } from '../../api/branches';

const STATUSES = {
  Active: { label: 'Работает', color: 'success', icon: CheckCircle },
  OnLeave: { label: 'В отпуске', color: 'warning', icon: Clock },
  Dismissed: { label: 'Уволен', color: 'muted', icon: XCircle },
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [employeesData, branchesData] = await Promise.all([
        getEmployees(),
        getBranches()
      ]);
      setEmployees(employeesData);
      setBranches(branchesData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setEditingEmployee(null); setIsModalOpen(true); }
  function handleEdit(employee) { setEditingEmployee(employee); setIsModalOpen(true); }

  async function handleDelete(id) {
    if (!confirm('Удалить сотрудника?')) return;
    try {
      await deleteEmployee(id);
      await loadData();
    } catch (err) {
      setError('Не удалось удалить сотрудника');
    }
  }

  async function handleSave(data) {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data);
      } else {
        await createEmployee(data);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError('Не удалось сохранить сотрудника');
    }
  }

  const filteredEmployees = filter === 'all'
    ? employees
    : employees.filter(e => e.status === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Сотрудники</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Справочник сотрудников, должности, ставки оплаты</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-4 h-4" />Добавить
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'all', label: 'Все' }, { key: 'Active', label: 'Работают' }, { key: 'OnLeave', label: 'В отпуске' }, { key: 'Dismissed', label: 'Уволены' }].map(tab => (
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
      ) : filteredEmployees.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4"><UserCog className="w-8 h-8 text-[hsl(var(--muted-foreground))]" /></div>
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Нет сотрудников</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Добавьте первого сотрудника</p>
            <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Plus className="w-4 h-4" />Добавить сотрудника
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[hsl(var(--card))]">
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-center px-2 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))] w-10">#</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">ФИО</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Должность</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Филиал</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Телефон</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Ставка/день</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Оклад/мес</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Статус</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, index) => {
                const status = STATUSES[employee.status] || { label: employee.status, color: 'muted', icon: XCircle };
                const StatusIcon = status.icon;
                return (
                  <tr key={employee.id} className={index !== filteredEmployees.length - 1 ? 'border-b border-[hsl(var(--border))]' : ''}>
                    <td className="px-2 py-3 text-center">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">{employee.fullName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{employee.position || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{employee.branchName || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{employee.phone || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">{employee.dailyRate ? employee.dailyRate.toLocaleString() : '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{employee.monthlyRate ? employee.monthlyRate.toLocaleString() : '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-[hsl(var(--${status.color}))]/10 text-[hsl(var(--${status.color}))]`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(employee)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(employee.id)} className="p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (<EmployeeModal employee={editingEmployee} branches={branches} onSave={handleSave} onClose={() => setIsModalOpen(false)} />)}
    </div>
  );
}

function EmployeeModal({ employee, branches, onSave, onClose }) {
  const [formData, setFormData] = useState({
    fullName: employee?.fullName || '',
    position: employee?.position || '',
    phone: employee?.phone || '',
    hireDate: employee?.hireDate || '',
    dailyRate: employee?.dailyRate || '',
    monthlyRate: employee?.monthlyRate || '',
    branchId: employee?.branchId || '',
    status: employee?.status || 'Active',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      fullName: formData.fullName,
      position: formData.position || null,
      phone: formData.phone || null,
      hireDate: formData.hireDate || null,
      dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
      monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
      branchId: formData.branchId ? parseInt(formData.branchId) : null,
      status: formData.status,
    });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--card))] rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{employee ? 'Редактировать сотрудника' : 'Новый сотрудник'}</h2>
          <button onClick={onClose} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">ФИО *</label>
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={inputClass} placeholder="Иванов Иван Иванович" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Должность</label>
              <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className={inputClass} placeholder="Оператор линии" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Филиал</label>
              <select value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} className={inputClass}>
                <option value="">Не указан</option>
                {branches.filter(b => b.status === 'Active').map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Телефон</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+992 900 123456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Дата найма</label>
              <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Ставка в день (TJS)</label>
              <input type="number" step="0.01" min="0" value={formData.dailyRate} onChange={(e) => {
                const daily = e.target.value;
                const monthly = daily ? (parseFloat(daily) * 30).toFixed(2) : '';
                setFormData({ ...formData, dailyRate: daily, monthlyRate: monthly });
              }} className={inputClass} placeholder="100.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Оклад в месяц (TJS)</label>
              <input type="number" step="0.01" min="0" value={formData.monthlyRate} readOnly className={inputClass + " bg-[hsl(var(--muted))]/50 cursor-not-allowed"} placeholder="3000.00" />
            </div>
          </div>
          {employee && (
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
            <button type="submit" className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium">{employee ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
