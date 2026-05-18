import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const can = (section) => user.role === 'admin' || user.permissions.includes(section);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Signi CMS</div>
        <nav>
          {can('blog') && <NavLink to="/articles">Články</NavLink>}
          {can('logs') && <NavLink to="/submissions">Formuláře</NavLink>}
          {can('users') && <NavLink to="/users">Uživatelé</NavLink>}
        </nav>
        <div className="sidebar-user">
          <span title={user.email}>{user.email}</span>
          <button type="button" onClick={logout}>
            Odhlásit
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
