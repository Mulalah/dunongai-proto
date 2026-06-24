import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LEVEL_NAMES } from '../../utils/levelUtils';
import Logo from '../ui/Logo';
import Icon from '../ui/Icon';

const NAV = [
  { to: '/student/library', label: 'Mga Kwento', icon: 'book' },
  { to: '/student/progress', label: 'Progreso', icon: 'star' },
  { to: '/settings', label: 'Settings', icon: 'settings' }
];

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const level = profile?.currentLevel || 3;
  const streak = profile?.streakDays ?? 5;
  const initials = (profile?.displayName || 'JC')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`md:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center shadow-lg ${open ? 'hidden' : ''}`}
        aria-label="Buksan ang menu"
      >
        <Icon name="menu" size={20} />
      </button>
      {open && (
        <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />
      )}
      <aside
        className={`on-dark fixed left-0 top-0 h-screen w-[260px] flex flex-col text-white z-40 transform transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0A1628 0%, #0D1F35 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)'
        }}
      >
      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <Logo variant="dark" className="h-9 w-auto" />
        <div className="mt-2 text-xs text-white/50 font-body">Basahin Natin Ito!</div>
      </div>

      {/* Nav */}
      <nav className="px-3 mt-4 flex-1 overflow-y-auto">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-2.5 my-1 rounded-xl text-sm font-heading font-semibold transition ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-teal" />
                )}
                <Icon name={n.icon} size={19} className={isActive ? 'text-teal-300' : ''} />
                <span>{n.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Level card */}
      <div className="mx-3 mt-2 mb-2 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-body text-white/50 uppercase tracking-wide">
            <Icon name="bookOpen" size={12} /> Kasalukuyang Antas sa Pagbasa
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gold font-semibold">
            <Icon name="flame" size={14} /> {streak}
          </span>
        </div>
        <div className="mt-1 font-heading font-bold text-lg text-gold">
          {LEVEL_NAMES[level]}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-teal" style={{ width: '60%' }} />
        </div>
        <div className="mt-1.5 text-[10px] text-white/40">
          3 sessions papunta sa Pagbasa {Math.min(level + 1, 6)}
        </div>
      </div>

      {/* User */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {profile?.displayName || 'Juan dela Cruz'}
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition"
            >
              <Icon name="logOut" size={13} /> Mag-logout
            </button>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
