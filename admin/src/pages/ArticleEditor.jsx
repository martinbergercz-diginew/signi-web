import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, uploadImage } from '../api.js';
import RichText from '../components/RichText.jsx';

const LANGUAGES = ['cs', 'en', 'sk', 'hu'];
const EMPTY = {
  title: '',
  slug: '',
  language: 'cs',
  main_image: '',
  content_html: '',
  status: 'draft',
};

function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const pick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        onChange(await uploadImage(file));
      } catch (e) {
        window.alert(e.message);
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };
  return (
    <div className="image-field">
      <span className="label">Hlavní obrázek</span>
      {value && <img className="thumb" src={value} alt="" />}
      <div className="row">
        <button type="button" className="link" onClick={pick}>
          {busy ? 'Nahrávám…' : value ? 'Změnit obrázek' : 'Nahrát obrázek'}
        </button>
        {value && (
          <button type="button" className="link-danger" onClick={() => onChange('')}>
            Odebrat
          </button>
        )}
      </div>
    </div>
  );
}

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [article, setArticle] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api
      .get(`/api/articles/${id}`)
      .then((a) => setArticle({ ...EMPTY, ...a, main_image: a.main_image || '' }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (key, val) => setArticle((a) => ({ ...a, [key]: val }));

  const save = async () => {
    setError('');
    setBusy(true);
    try {
      const payload = { ...article, main_image: article.main_image || null };
      if (isNew) {
        await api.post('/api/articles', payload);
        navigate('/articles');
      } else {
        const updated = await api.put(`/api/articles/${id}`, payload);
        setArticle({ ...EMPTY, ...updated, main_image: updated.main_image || '' });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="loading">Načítání…</div>;

  return (
    <div className="editor">
      <div className="page-head">
        <h1>{isNew ? 'Nový článek' : 'Upravit článek'}</h1>
        <button type="button" className="btn" disabled={busy} onClick={save}>
          {busy ? 'Ukládám…' : 'Uložit'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}

      <label>
        Název
        <input value={article.title} onChange={(e) => set('title', e.target.value)} />
      </label>

      <div className="row">
        <label>
          Slug
          <input value={article.slug} onChange={(e) => set('slug', e.target.value)} />
        </label>
        <label>
          Jazyk
          <select value={article.language} onChange={(e) => set('language', e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stav
          <select value={article.status} onChange={(e) => set('status', e.target.value)}>
            <option value="draft">Koncept</option>
            <option value="published">Publikováno</option>
          </select>
        </label>
      </div>

      <ImageField value={article.main_image} onChange={(v) => set('main_image', v)} />

      <span className="label">Obsah</span>
      <RichText value={article.content_html} onChange={(v) => set('content_html', v)} />
    </div>
  );
}
