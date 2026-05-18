import { useEffect, useState } from 'react';
import { api } from '../api.js';

const SECTIONS = ['blog', 'logs', 'users'];
const BLANK = { id: null, email: '', password: '', role: 'user', permissions: [] };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/api/users')
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const togglePerm = (section) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(section)
        ? f.permissions.filter((s) => s !== section)
        : [...f.permissions, section],
    }));

  const editUser = (u) =>
    setForm({ id: u.id, email: u.email, password: '', role: u.role, permissions: u.permissions });
  const reset = () => setForm(BLANK);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { email: form.email, role: form.role, permissions: form.permissions };
      if (form.password) payload.password = form.password;
      if (form.id) await api.put(`/api/users/${form.id}`, payload);
      else await api.post('/api/users', payload);
      reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Opravdu smazat tohoto uživatele?')) return;
    try {
      await api.del(`/api/users/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Načítání…</div>;

  return (
    <div>
      <h1>Uživatelé</h1>
      {error && <div className="error">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>E-mail</th>
            <th>Role</th>
            <th>Sekce</th>
            <th aria-label="akce" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role === 'admin' ? 'Administrátor' : 'Uživatel'}</td>
              <td>{u.role === 'admin' ? 'vše' : u.permissions.join(', ') || '—'}</td>
              <td>
                <button type="button" className="link" onClick={() => editUser(u)}>
                  Upravit
                </button>
                <button type="button" className="link-danger" onClick={() => remove(u.id)}>
                  Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="card" onSubmit={submit}>
        <h2>{form.id ? 'Upravit uživatele' : 'Nový uživatel'}</h2>
        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
          />
        </label>
        <label>
          {form.id ? 'Heslo (prázdné = beze změny)' : 'Heslo'}
          <input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required={!form.id}
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(e) => set('role', e.target.value)}>
            <option value="user">Uživatel</option>
            <option value="admin">Administrátor</option>
          </select>
        </label>
        {form.role !== 'admin' && (
          <fieldset>
            <legend>Přístup k sekcím</legend>
            {SECTIONS.map((s) => (
              <label key={s} className="check">
                <input
                  type="checkbox"
                  checked={form.permissions.includes(s)}
                  onChange={() => togglePerm(s)}
                />
                {s}
              </label>
            ))}
          </fieldset>
        )}
        <div className="row">
          <button type="submit" className="btn">
            {form.id ? 'Uložit' : 'Vytvořit'}
          </button>
          {form.id && (
            <button type="button" className="link" onClick={reset}>
              Zrušit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
