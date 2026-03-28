import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useFirestore';
import { getGameColor, getGameShortCode } from '../utils/games';
import { Plus, Play, UserPlus, FileText, Trophy } from 'lucide-react';

export default function ManagerDashboard() {
  const { userDoc } = useAuth();
  const navigate = useNavigate();
  const { data: players } = useCollection('players');
  const { data: tournaments } = useCollection('tournaments');
  const { data: financials } = useCollection('financial_logs', [], 'createdAt');
  const { data: scrims } = useCollection('scrims');

  const stats = useMemo(() => {
    const activeP = players.filter(p => p.isActive).length;
    const scheduledScrims = scrims.filter(s => s.status === 'scheduled' || s.status === 'live').length;
    const totalMatches = players.reduce((s, p) => s + (p.stats?.totalMatches || 0), 0);
    const totalWins = players.reduce((s, p) => s + (p.stats?.wins || 0), 0);
    const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : 0;
    return { activeP, scheduledScrims, winRate };
  }, [players, scrims]);

  const formatCurrency = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 2)}`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const totalBalance = useMemo(() => {
    const totalSalaries = players.filter(p => p.isActive && p.salary).reduce((s, p) => s + Number(p.salary), 0);
    const totalEntryFees = tournaments.reduce((s, t) => s + (Number(t.entryFee?.amount) || 0), 0);
    const income = tournaments.filter(t => t.status === 'completed').reduce((s, t) => s + (Number(t.prizePool) || 0), 0);
    const expense = totalSalaries + totalEntryFees;
    return income - expense;
  }, [players, tournaments]);

  const upcomingScrims = scrims.filter(s => s.status === 'scheduled' || s.status === 'live').slice(0, 3);
  const liveScrims = scrims.filter(s => s.status === 'live' || s.status === 'completed').slice(0, 2);
  const activeAthletes = players.filter(p => p.isActive).slice(0, 3);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2 block">System Status: Optimal</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-pink-500/30 px-4 py-2 rounded-xl">
          <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#FF2D78]"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-pink-400">Live Region: Mumbai-1</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard delay={0.1} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Total Athletes</p>
          <p className="text-3xl font-black font-display text-cyan-400 mb-1">{stats.activeP}</p>
          <p className="text-[10px] text-green-400 font-bold">+3 Active this month</p>
        </GlassCard>

        <GlassCard delay={0.15} className="!p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Scrims Scheduled</p>
          </div>
          <p className="text-3xl font-black font-display text-white mb-1">{stats.scheduledScrims}</p>
          <p className="text-[10px] text-slate-400 font-bold">Next session in 2h 45m</p>
        </GlassCard>

        <GlassCard delay={0.2} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Win Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black font-display text-green-400">{stats.winRate}%</p>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${stats.winRate}%` }}></div>
          </div>
        </GlassCard>

        <GlassCard delay={0.25} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Monthly Growth</p>
          <p className="text-3xl font-black font-display text-white mb-1">14%</p>
          <p className="text-[10px] text-green-400 font-bold">Social Engagement up</p>
        </GlassCard>
      </div>

      {/* Quick Command Center */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 mb-4">Quick Command Center</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Plus size={20} />, label: 'Add Tournament', onClick: () => navigate('/tournaments') },
            { icon: <Play size={20} />, label: 'Start Scrim', onClick: () => navigate('/scrims') },
            { icon: <UserPlus size={20} />, label: 'Add Player', onClick: () => navigate('/players') },
            { icon: <FileText size={20} />, label: 'Export Stats', onClick: () => {} },
          ].map((cmd, i) => (
            <button key={i} onClick={cmd.onClick} className="flex items-center justify-center gap-3 glass-card px-6 py-4 rounded-2xl text-xs font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 hover:shadow-[0_0_15px_rgba(0,245,255,0.15)] transition-all group">
              <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">{cmd.icon}</span>
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Summary + Upcoming Scrims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Summary */}
        <GlassCard delay={0.3} className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black font-display tracking-widest text-white uppercase">Financial Summary</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Transaction History & Burn Rate</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Balance</p>
              <p className="text-xl font-black font-display text-green-400">₹ {totalBalance.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {financials.slice(0, 3).map((f, i) => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-xs font-display text-slate-400">#ZX-{9921 - i}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{f.notes}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-black font-display ${f.type === 'income' ? 'text-green-400' : 'text-pink-400'}`}>
                      {f.type === 'income' ? '+' : '-'} ₹{f.amount?.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${f.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-green-400/10 text-green-400'}`}>
                      {f.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>

        {/* Upcoming Scrims */}
        <GlassCard delay={0.35} className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Upcoming Scrims</h3>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><circle cx="8" cy="8" r="1"/><circle cx="8" cy="3" r="1"/><circle cx="8" cy="13" r="1"/></svg>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingScrims.map(s => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getGameColor(s.game) }}></span>
                  <div>
                    <p className="text-sm font-bold text-white">{s.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{s.opponent}</p>
                  </div>
                </div>
                <span className="text-sm font-black font-display text-white">{new Date(s.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            <button onClick={() => navigate('/scrims')} className="w-full px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-cyan-400 hover:bg-cyan-400/5 transition-colors text-center">View Full Calendar</button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Match Results + Active Athletes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Results */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveScrims.map(s => (
            <GlassCard key={s.id} delay={0.4} className="!p-0 overflow-hidden">
              <div className="p-4">
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${s.result === 'victory' ? 'bg-green-400/10 text-green-400' : 'bg-pink-400/10 text-pink-400'}`}>
                  {s.result === 'victory' ? 'WIN' : 'LOSS'}
                </span>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-2">{s.game} — {s.title}</p>
              </div>
              <div className="px-6 py-4 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mb-2">
                    <span className="text-[10px] font-black font-display text-cyan-400">ZX</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Zentrix</span>
                </div>
                <span className="text-2xl font-black font-display text-white">{s.scoreUs} - {String(s.scoreThem).padStart(2, '0')}</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                    <Trophy size={16} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">{s.opponent.split(' ')[0]}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center pb-4 px-4">{s.map} • {s.format}</p>
            </GlassCard>
          ))}
        </div>

        {/* Active Athletes */}
        <GlassCard delay={0.45} className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Active Athletes</h3>
          </div>
          <div className="divide-y divide-white/5">
            {activeAthletes.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${p.ign}&background=0A0A1A&color=00F5FF&size=40`} alt={p.ign} className="w-full h-full rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{p.ign}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{p.game} / {p.role}</p>
                  </div>
                </div>
                <span className={`text-sm font-black font-display ${p.isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                  {p.stats?.kd || 0} KD{p.isActive ? '' : 'A'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
