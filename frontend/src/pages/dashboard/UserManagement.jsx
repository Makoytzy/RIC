import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import Button from '../../components/common/Button.jsx';

const ALL_ROLES = ['admin', 'manager', 'operational_staff', 'warehouse_staff', 'sales_staff'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(userId, roleName, has) {
    try {
      await api.post(`/roles/${has ? 'remove' : 'assign'}`, { userId, roleName });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(userId, isActive) {
    try {
      await api.patch(`/users/${userId}/active`, { isActive: !isActive });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Users &amp; Roles</h1>
      <p className="mt-1 text-sm text-slate-500">Assign roles and manage account access.</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map((role) => {
                      const has = u.roles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => toggleRole(u.id, role, has)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            has
                              ? 'border-brand-300 bg-brand-50 text-brand-700'
                              : 'border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {role.replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button variant={u.isActive ? 'ghost' : 'primary'} onClick={() => toggleActive(u.id, u.isActive)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
