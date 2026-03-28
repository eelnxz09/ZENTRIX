import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonToggle } from '../components/ui/NeonToggle';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { getRoleLabel } from '../utils/permissions';
import { Badge } from '../components/ui/Badge';
import { Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { userDoc } = useAuth();
  const { role } = useRole();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [sounds, setSounds] = React.useState(false);

  return (
    <div className="animate-fade-up max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="System Configuration" />

      {/* Account Info */}
      <GlassCard delay={0.1} className="mb-6">
        <h3 className="text-sm font-black font-display tracking-widest text-white uppercase mb-4 flex items-center gap-2">
          <Shield size={16} className="text-cyan-400" /> Account
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Email</span>
            <span className="text-sm text-white font-mono">{userDoc?.email}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Role</span>
            <Badge variant={role}>{getRoleLabel(role)}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Status</span>
            <Badge variant="active" dot>Active</Badge>
          </div>
        </div>
      </GlassCard>

      {/* Preferences */}
      <GlassCard delay={0.2} className="mb-6">
        <h3 className="text-sm font-black font-display tracking-widest text-white uppercase mb-4 flex items-center gap-2">
          <Palette size={16} className="text-purple-400" /> Preferences
        </h3>
        <div className="space-y-4">
          <NeonToggle checked={darkMode} onChange={setDarkMode} label="Dark Mode" />
          <NeonToggle checked={notifications} onChange={setNotifications} label="Push Notifications" />
          <NeonToggle checked={sounds} onChange={setSounds} label="Sound Effects" />
        </div>
      </GlassCard>

      {/* Version */}
      <div className="text-center mt-8">
        <p className="text-[10px] text-slate-600 font-mono">Zentrix OS v2.0.0 — Build 2026.03.28</p>
        <p className="text-[10px] text-slate-700 font-mono mt-1">© 2026 Zentrix Esports India</p>
      </div>
    </div>
  );
}
