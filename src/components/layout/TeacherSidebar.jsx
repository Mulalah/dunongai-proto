import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/teacher/flagged', label: 'Kailangan ng Tulong', icon: '⚠️' }
];

export default function TeacherSidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (profile?.displayName || 'AR')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col text-white"
      style={{
        background: 'linear-gradient(180deg, #0A1628 0%, #0D1F35 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <div className="px-6 pt-7 pb-5">
        <div className="font-heading text-2xl font-extrabold tracking-tight">DunongAI</div>
        <div className="mt-1.5 h-1 w-10 rounded bg-gold" />
        <div className="mt-2 text-xs text-white/50 font-body">Teacher Portal</div>
      </div>

      <nav className="px-3 mt-4 flex-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 my-1 rounded-xl text-sm font-heading font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-teal/30 to-teal/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-teal" />
                )}
                <span className="text-lg">{n.icon}</span>
                <span>{n.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mb-2 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Aking Klase</div>
        <div className="inline-block px-3 py-1 rounded-full bg-teal/20 text-teal-100 text-xs font-semibold">
          {profile?.className || 'Grade 3 - Rizal'}
        </div>
      </div>

      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-amber-300 flex items-center justify-center text-navy font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {profile?.displayName || "Ma'am Ana Reyes"}
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="text-xs text-white/50 hover:text-white transition"
            >
              Mag-logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
