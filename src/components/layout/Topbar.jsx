import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useCollection } from '../../hooks/useFirestore';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { getRoleLabel } from '../../utils/permissions';

export default function Topbar({ onMenuClick }) {
  const { userDoc, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="fixed top-0 right-0 h-16 w-full md:w-[calc(100%-260px)] z-30 bg-slate-950/40 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">

        <div className="flex items-center gap-4 flex-1">
          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            className="md:hidden text-cyan-400 p-2 -ml-2 w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="relative w-full max-w-xs sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search players, tournaments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-white/5 border-none rounded-full py-2 pl-9 pr-4 text-xs sm:text-sm w-full text-white focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Notifications Bell */}
          <Link to="/notifications" className="relative p-2 text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block">
            <Bell size={20} />
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white uppercase tracking-tighter">{userDoc?.displayName || 'User'}</p>
              <p className="text-[10px] text-cyan-400 font-display uppercase tracking-widest">{getRoleLabel(role)}</p>
            </div>

            {/* Avatar with dropdown */}
            <div className="relative">
              <Avatar
                src={userDoc?.photoURL}
                name={userDoc?.displayName || 'U'}
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="cursor-pointer border-cyan-400/30 hover:border-cyan-400/60 transition-colors"
              />

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A1A] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase tracking-widest transition-colors"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <div className="h-px bg-white/5" />
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-pink-400 hover:bg-pink-400/5 uppercase tracking-widest transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
