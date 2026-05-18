import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/api/articles')
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Opravdu smazat tento článek?')) return;
    try {
      await api.del(`/api/articles/${id}`);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="loading">Načítání…</div>;

  return (
    <div>
      <div className="page-head">
        <h1>Články</h1>
        <Link className="btn" to="/articles/new">
          Nový článek
        </Link>
      </div>
      {error && <div className="error">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Název</th>
            <th>Jazyk</th>
            <th>Stav</th>
            <th>Upraveno</th>
            <th aria-label="akce" />
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td>
                <Link to={`/articles/${a.id}`}>{a.title}</Link>
              </td>
              <td>{a.language}</td>
              <td>{a.status === 'published' ? 'Publikováno' : 'Koncept'}</td>
              <td>{a.updated_at}</td>
              <td>
                <button type="button" className="link-danger" onClick={() => remove(a.id)}>
                  Smazat
                </button>
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td colSpan={5}>Zatím žádné články.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
