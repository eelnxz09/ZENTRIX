import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useFirestore';
import { getGameShortCode, getGameColor } from '../utils/games';
import { Users, Trophy, IndianRupee, Wallet, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function OwnerDashboard() {
  const { userDoc } = useAuth();
  const { data: players } = useCollection('players');
  const { data: tournaments } = useCollection('tournaments');
  const { data: financials } = useCollection('financial_logs', [], 'createdAt');
  const { data: scrims } = useCollection('scrims');
  const { data: auditLogs } = useCollection('audit_demo', [], 'timestamp');

  const stats = useMemo(() => {
    const totalSalaries = players.filter(p => p.isActive && p.salary).reduce((s, p) => s + Number(p.salary), 0);
    const totalEntryFees = tournaments.reduce((s, t) => s + (Number(t.entryFee?.amount) || 0), 0);
    const totalIncome = tournaments.filter(t => t.status === 'completed').reduce((s, t) => s + (Number(t.prizePool) || 0), 0);
    const totalExpense = totalSalaries + totalEntryFees;
    
    const activeTournaments = tournaments.filter(t => t.status === 'live' || t.status === 'upcoming').length;
    return { totalIncome, totalExpense, activeTournaments };
  }, [players, tournaments]);

  // Team composition for pie chart
  const teamComposition = useMemo(() => {
    const gameCount = {};
    players.forEach(p => {
      gameCount[p.game] = (gameCount[p.game] || 0) + 1;
    });
    return Object.entries(gameCount).map(([name, value]) => ({ name, value, color: getGameColor(name) }));
  }, [players]);

  const readiness = useMemo(() => {
    const activeP = players.filter(p => p.isActive).length;
    return players.length > 0 ? Math.round((activeP / players.length) * 100) : 0;
  }, [players]);

  const formatCurrency = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const liveScrims = scrims.filter(s => s.status === 'live' || s.status === 'completed').slice(0, 3);
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming' || t.status === 'live').slice(0, 3);

  const handleExportCSV = () => {
    if(!financials.length) return toast.error('No financials to export');
    const headers = ['Date,Type,Category,Amount,Description'];
    const rows = financials.map(t => {
       const date = new Date(t.createdAt).toLocaleDateString() || '';
       const type = t.type === 'income' ? 'INCOME' : 'EXPENSE';
       const amount = t.amount || 0;
       return `${date},${type},${t.notes || ''},${amount},"${t.notes || ''}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zentrix_Financials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial CSV Downloaded', {icon: '📊'});
  };

  const handleExportPlayersCSV = () => {
    if(!players.length) return toast.error('No players to export');
    const headers = ['IGN,Name,Game,Role,Team,K/D,Status'];
    const rows = players.map(p => {
       const teamName = p.teamId ? 'Assigned' : 'Free Agent';
       return `${p.ign},${p.displayName},${p.game},${p.role || 'Player'},${teamName},${p.stats?.kd || '0'},${p.isActive ? 'Active' : 'Inactive'}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zentrix_Players_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Player CSV Downloaded', {icon: '🎮'});
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2 block">System Status: Operational</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">OWNER DASHBOARD</h1>
        </div>
        <button onClick={handleExportPlayersCSV} className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase hover:text-white transition-colors flex items-center gap-2 bg-white/5 border border-cyan-500/30 px-4 py-2 rounded-xl">
           <Download size={14} /> Export Players Data
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard delay={0.1} className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <Users size={20} className="text-cyan-400" />
            <span className="text-[9px] font-black tracking-widest uppercase text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Growth +12%</span>
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Total Players</p>
          <p className="text-3xl font-black font-display text-cyan-400">{players.length}</p>
        </GlassCard>

        <GlassCard delay={0.15} className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <Trophy size={20} className="text-purple-400" />
            <span className="text-[9px] font-black tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Live Now</span>
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Active Tournaments</p>
          <p className="text-3xl font-black font-display text-white">0{stats.activeTournaments}</p>
        </GlassCard>

        <GlassCard delay={0.2} className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <IndianRupee size={20} className="text-green-400" />
            <span className="text-[9px] font-black tracking-widest uppercase text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Q3 Revenue</span>
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Total Earnings</p>
          <p className="text-3xl font-black font-display text-green-400">{formatCurrency(stats.totalIncome)}</p>
        </GlassCard>

        <GlassCard delay={0.25} className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <Wallet size={20} className="text-pink-400" />
            <span className="text-[9px] font-black tracking-widest uppercase text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded">Expenses</span>
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Total Spent</p>
          <p className="text-3xl font-black font-display text-pink-400">{formatCurrency(stats.totalExpense)}</p>
        </GlassCard>
      </div>

      {/* Financial Activity + Team Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Activity */}
        <GlassCard delay={0.3} className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-black font-display tracking-widest text-white uppercase">Financial Activity</h3>
            <button onClick={handleExportCSV} className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase hover:text-white transition-colors flex items-center gap-1"><Download size={12} /> Export CSV</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {financials.slice(0, 5).map(f => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-300">{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${f.type === 'income' ? 'bg-green-400/10 text-green-400' : 'bg-pink-400/10 text-pink-400'}`}>
                      {f.type === 'income' ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">{f.notes}</td>
                  <td className="px-6 py-4 text-sm font-black font-display text-white">₹{f.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    {f.proofURL ? (
                      <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><rect x="1" y="1" width="12" height="12" rx="2"/><path d="M1 9l3-3 2 2 4-4 3 3"/></svg>
                      </div>
                    ) : <span className="text-[10px] text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>

        {/* Team Composition Pie */}
        <GlassCard delay={0.35} className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-black font-display tracking-widest text-white uppercase mb-6 self-start">Team Composition</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={teamComposition} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                  {teamComposition.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-display text-white">{readiness}%</span>
              <span className="text-[8px] font-bold tracking-widest text-cyan-400 uppercase">Readiness</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {teamComposition.map(tc => (
              <div key={tc.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tc.color }}></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{tc.name} ({Math.round(tc.value / players.length * 100)}%)</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Upcoming Tournaments + Live Scrims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Tournaments */}
        <GlassCard delay={0.4} className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Upcoming Tournaments</h3>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><rect x="2" y="3" width="14" height="13" rx="2"/><path d="M2 7h14M6 1v4M12 1v4"/></svg>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingTournaments.map(t => (
              <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black font-display text-[10px] text-white border border-white/10" style={{ backgroundColor: getGameColor(t.game) + '20', borderColor: getGameColor(t.game) + '40' }}>
                    {getGameShortCode(t.game)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Starts in {Math.ceil((new Date(t.startDate) - Date.now()) / 86400000)} days • {t.location}</p>
                  </div>
                </div>
                <span className="text-sm font-black font-display text-green-400">{formatCurrency(t.prizePool)} Prize</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Live Scrims Feed */}
        <GlassCard delay={0.45} className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Live Scrims Feed</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#FF2D78]"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-pink-400">Live Now</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {liveScrims.map(s => (
              <div key={s.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: getGameColor(s.game) }}>{s.title}</span>
                  <span className="text-[10px] text-slate-500">{new Date(s.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-300">vs {s.opponent} (Map: {s.map})</p>
                {s.scoreUs !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black font-display text-white">{s.scoreUs} - {s.scoreThem}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded ${s.result === 'victory' ? 'bg-green-400/10 text-green-400' : 'bg-pink-400/10 text-pink-400'}`}>
                      {s.result}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* System Audit Log */}
      <GlassCard delay={0.5} className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black font-display tracking-widest text-white uppercase flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3 2"/></svg>
            System Audit Log
          </h3>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase">Last Sync: Just Now</span>
            <RefreshCw size={14} className="cursor-pointer hover:text-cyan-400 transition-colors" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">User</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Entity/Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {auditLogs.slice(0, 4).map(al => {
              const statusColors = {
                verified: 'bg-green-400/10 text-green-400', success: 'bg-green-400/10 text-green-400',
                synced: 'bg-cyan-400/10 text-cyan-400', updated: 'bg-purple-400/10 text-purple-400'
              };
              const actionColors = {
                approve_expense: 'bg-green-400/10 text-green-400', user_login: 'bg-cyan-400/10 text-cyan-400',
                data_sync: 'bg-yellow-400/10 text-yellow-400', update_roster: 'bg-purple-400/10 text-purple-400',
                tournament_added: 'bg-green-400/10 text-green-400', financial_entry: 'bg-green-400/10 text-green-400'
              };
              return (
                <tr key={al.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-300 whitespace-nowrap">{new Date(al.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{al.performedByName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${actionColors[al.action] || 'bg-white/5 text-slate-400'}`}>
                      {al.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300 max-w-[300px] truncate">{al.entity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${statusColors[al.status] || 'bg-white/5 text-slate-400'}`}>
                      {al.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
