import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Submissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = () =>
    api
      .get('/api/submissions')
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/submissions/${id}`, { status: 'read' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Načítání…</div>;

  const open = items.find((s) => s.id === openId);

  return (
    <div>
      <h1>Formuláře</h1>
      {error && <div className="error">{error}</div>}
      {items.length === 0 && <p>Zatím žádná odeslání. Veřejné formuláře se připojí ve fázi 7.</p>}
      {items.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Typ</th>
              <th>Odesláno</th>
              <th>Stav</th>
              <th aria-label="akce" />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className={s.status === 'new' ? 'unread' : ''}>
                <td>{s.form_type}</td>
                <td>{s.created_at}</td>
                <td>{s.status === 'new' ? 'Nové' : 'Přečteno'}</td>
                <td>
                  <button
                    type="button"
                    className="link"
                    onClick={() => setOpenId(openId === s.id ? null : s.id)}
                  >
                    Detail
                  </button>
                  {s.status === 'new' && (
                    <button type="button" className="link" onClick={() => markRead(s.id)}>
                      Označit přečtené
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && <pre className="card payload">{JSON.stringify(open.payload, null, 2)}</pre>}
    </div>
  );
}
