import React, { useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useCollection } from '../hooks/useFirestore';
import { useCountUp } from '../hooks/useCountUp';
import { getGameColor, getGameShortCode, GAMES } from '../utils/games';
import { formatCurrency } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Target, Trophy, Users } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';

export default function Analytics() {
  const { data: players } = useCollection('players');
  const { data: tournaments } = useCollection('tournaments');
  const { data: scrims } = useCollection('scrims');
  const { data: financials } = useCollection('financial_logs');

  const stats = useMemo(() => {
    const totalMatches = players.reduce((s, p) => s + (p.stats?.totalMatches || 0), 0);
    const totalWins = players.reduce((s, p) => s + (p.stats?.wins || 0), 0);
    const totalKills = players.reduce((s, p) => s + (p.stats?.kills || 0), 0);
    const avgKD = players.length > 0
      ? (players.reduce((s, p) => s + (p.stats?.kd || 0), 0) / players.length).toFixed(2)
      : 0;
    const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : 0;

    return { totalMatches, totalWins, totalKills, avgKD, winRate };
  }, [players]);

  // Game distribution
  const gameDistribution = useMemo(() => {
    const counts = {};
    players.forEach(p => { counts[p.game] = (counts[p.game] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: getGameColor(name) }));
  }, [players]);

  // Financial trend (mock monthly data from financial logs)
  const financialTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      income: Math.floor(Math.random() * 200000) + 50000,
      expense: Math.floor(Math.random() * 100000) + 20000,
    }));
  }, []);

  // Performance by game
  const gamePerformance = useMemo(() => {
    return GAMES.map(game => {
      const gamePlayers = players.filter(p => p.game === game.name);
      const wins = gamePlayers.reduce((s, p) => s + (p.stats?.wins || 0), 0);
      const matches = gamePlayers.reduce((s, p) => s + (p.stats?.totalMatches || 0), 0);
      return {
        game: game.shortCode,
        winRate: matches > 0 ? Math.round((wins / matches) * 100) : 0,
        matches,
        color: game.color,
      };
    });
  }, [players]);

  const animatedMatches = useCountUp(stats.totalMatches);
  const animatedKills = useCountUp(stats.totalKills);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Analytics" subtitle="Performance Intelligence" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard delay={0.1} className="!p-5">
          <Target size={20} className="text-cyan-400 mb-3" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Total Matches</p>
          <p className="text-3xl font-black font-display text-white">{animatedMatches.toLocaleString()}</p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-5">
          <TrendingUp size={20} className="text-green-400 mb-3" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Win Rate</p>
          <p className="text-3xl font-black font-display text-green-400">{stats.winRate}%</p>
        </GlassCard>
        <GlassCard delay={0.2} className="!p-5">
          <Trophy size={20} className="text-yellow-500 mb-3" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Total Kills</p>
          <p className="text-3xl font-black font-display text-white">{animatedKills.toLocaleString()}</p>
        </GlassCard>
        <GlassCard delay={0.25} className="!p-5">
          <Users size={20} className="text-purple-400 mb-3" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Avg K/D</p>
          <p className="text-3xl font-black font-display text-purple-400">{stats.avgKD}</p>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Game Performance Bar Chart */}
        <GlassCard delay={0.3} className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Win Rate by Game</h3>
          </div>
          <div className="p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gamePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="game" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0A0A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: '#fff', fontWeight: 700 }}
                />
                <Bar dataKey="winRate" fill="#00F5FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Team Composition Pie */}
        <GlassCard delay={0.35} className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-black font-display tracking-widest text-white uppercase mb-6 self-start">Team Composition</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gameDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                  {gameDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-display text-white">{players.length}</span>
              <span className="text-[8px] font-bold tracking-widest text-cyan-400 uppercase">Players</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {gameDistribution.map(gd => (
              <div key={gd.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gd.color }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{gd.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Revenue Trend */}
      <GlassCard delay={0.4} className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Revenue Trend</h3>
        </div>
        <div className="p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={financialTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#0A0A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#00FF88" strokeWidth={2} dot={false} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#FF2D78" strokeWidth={2} dot={false} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
