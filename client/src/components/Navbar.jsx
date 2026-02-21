import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame, LayoutDashboard, ListTodo, Lightbulb, Shield, LogOut, ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/tasks', icon: ListTodo, label: 'Tâches' },
  { to: '/ideas', icon: Lightbulb, label: 'Idées' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="shrink-0 bg-dark-800 border-b border-dark-400/50">
      <div className="flex items-center h-14 px-6">
        <NavLink to="/" className="flex items-center gap-3 mr-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fivem to-orange-600 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white hidden sm:block">
            FiveM <span className="text-fivem">ORGA</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-fivem/10 text-fivem'
                    : 'text-slate-400 hover:text-white hover:bg-dark-600'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-slate-400 hover:text-white hover:bg-dark-600'
                }`
              }
            >
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </NavLink>
          )}
        </div>

        <div className="ml-auto relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-600 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center text-xs font-bold text-fivem uppercase">
              {user?.username?.[0] || '?'}
            </div>
            <span className="text-sm text-slate-300 font-medium hidden sm:block">{user?.username}</span>
            {user?.role === 'admin' && (
              <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded hidden sm:block">ADMIN</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl py-2 z-50 fade-in">
              <div className="px-4 py-2 border-b border-dark-400/50">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
