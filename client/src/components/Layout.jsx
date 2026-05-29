import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
      {/* Header */}
      <header className="bg-pakistan-green text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <HeartIcon />
          <div>
            <div className="font-bold text-sm leading-tight">CPR Pakistan</div>
            <div className="text-xs text-green-200 urdu">سی پی آر پاکستان</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-200 max-w-[100px] truncate">{user?.name}</span>
          <button onClick={handleLogout} className="text-xs bg-pakistan-dark px-2 py-1 rounded-lg">Logout</button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex z-40 shadow-lg">
        <NavLink to="/" end className={({ isActive }) => `nav-tab flex-1 ${isActive ? 'active' : ''}`}>
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        <NavLink to="/emergency" className={({ isActive }) => `nav-tab flex-1 ${isActive ? 'active' : ''}`}>
          <AlertIcon />
          <span>Emergency</span>
        </NavLink>
        {user?.role === 'provider' && (
          <NavLink to="/provider" className={({ isActive }) => `nav-tab flex-1 ${isActive ? 'active' : ''}`}>
            <ShieldIcon />
            <span>Respond</span>
          </NavLink>
        )}
        <NavLink to="/learn" className={({ isActive }) => `nav-tab flex-1 ${isActive ? 'active' : ''}`}>
          <BookIcon />
          <span>Learn BLS</span>
        </NavLink>
      </nav>
    </div>
  );
}
