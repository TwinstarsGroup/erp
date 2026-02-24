import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">ERP</div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/receipts" className={({ isActive }) => (isActive ? 'active' : '')}>
            Receipts
          </NavLink>
          <NavLink to="/vouchers" className={({ isActive }) => (isActive ? 'active' : '')}>
            Vouchers
          </NavLink>
        </div>
        <div className="nav-user">
          <span className="user-email">{user?.email}</span>
          <button onClick={signOut} className="btn btn-outline">
            Sign out
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
