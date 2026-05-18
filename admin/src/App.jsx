import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Articles from './pages/Articles.jsx';
import ArticleEditor from './pages/ArticleEditor.jsx';
import Login from './pages/Login.jsx';
import Submissions from './pages/Submissions.jsx';
import Users from './pages/Users.jsx';

function Protected({ children, section }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Načítání…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (section && user.role !== 'admin' && !user.permissions.includes(section)) {
    return <div className="loading">K této sekci nemáte přístup.</div>;
  }
  return children;
}

function Inner() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/articles" replace />} />
        <Route
          path="articles"
          element={
            <Protected section="blog">
              <Articles />
            </Protected>
          }
        />
        <Route
          path="articles/:id"
          element={
            <Protected section="blog">
              <ArticleEditor />
            </Protected>
          }
        />
        <Route
          path="submissions"
          element={
            <Protected section="logs">
              <Submissions />
            </Protected>
          }
        />
        <Route
          path="users"
          element={
            <Protected section="users">
              <Users />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}
