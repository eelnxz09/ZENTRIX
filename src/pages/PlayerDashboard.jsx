import React, { useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useFirestore';
import { Zap, Shield, Award, Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PlayerDashboard() {
  const { userDoc } = useAuth();
  const { data: players } = useCollection('players');
  const { data: scrims } = useCollection('scrims');
  const { data: announcements } = useCollection('announcements');
  const { data: tournaments } = useCollection('tournaments');
  const navigate = useNavigate();

  // Find the current player's data from the players collection, or use mock
  const playerData = useMemo(() => {
    if (!userDoc) return null;
    const found = players.find(p => p.id === userDoc.uid || p.displayName === userDoc.displayName);
    return found || {
      ign: userDoc.displayName || 'PLAYER',
      game: userDoc.game || 'Valorant',
      stats: { totalMatches: 1248, wins: 848, kills: 3420, kd: 2.48, accuracy: 68, clutchRate: 42 },
      role: 'Player'
    };
  }, [userDoc, players]);

  const totalEngagements = playerData?.stats?.totalMatches || 0;
  const winRate = totalEngagements > 0 ? Math.round((playerData?.stats?.wins || 0) / totalEngagements * 100) : 0;

  // Get upcoming scrims for this player's game
  const upcomingScrims = useMemo(() => {
    return scrims.filter(s => s.status === 'scheduled' || s.status === 'live').slice(0, 3);
  }, [scrims]);

  // Completed tournaments for this player
  const completedTournaments = tournaments.filter(t => t.status === 'completed').slice(0, 3);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2 block">Performance Hub</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">PLAYER DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-green-500/30 px-4 py-2 rounded-xl">
          <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-green-400">Server: India West</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard delay={0.1} className="!p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Total Engagements</p>
            <Zap size={18} className="text-slate-500" />
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black font-display text-white">{totalEngagements.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-green-400 mb-1">+12% vs LY</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="!p-6 border border-cyan-400/30 shadow-[0_0_30px_rgba(0,245,255,0.1)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">Tactical Win Rate</span>
          </div>
          <p className="text-5xl font-black font-display text-cyan-400">{winRate}%</p>
          <p className="text-[10px] text-slate-400 font-medium mt-2">Maintaining elite-tier performance across professional regional circuits.</p>
        </GlassCard>

        <GlassCard delay={0.2} className="!p-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Peak Ranking</p>
          <p className="text-5xl font-black font-display text-white">#1</p>
          <div className="flex items-center gap-2 mt-3">
            <Award size={14} className="text-yellow-500" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-500">Dominator Status</span>
          </div>
        </GlassCard>
      </div>

      {/* Upcoming Scrims + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Scrims */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black font-display tracking-tighter text-white flex items-center gap-2">
              <span className="w-4 h-0.5 bg-cyan-400 rounded"></span>
              Upcoming Scrims
            </h3>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">View Full Calendar</span>
          </div>
          <div className="space-y-3">
            {upcomingScrims.map((s, i) => {
              const isToday = new Date(s.scheduledAt).toDateString() === new Date().toDateString();
              const isTomorrow = new Date(s.scheduledAt).toDateString() === new Date(Date.now() + 86400000).toDateString();
              const dayLabel = isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : new Date(s.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              const statusLabels = { live: 'LOBBY INFO', scheduled: 'REMIND ME', completed: 'VIEW' };
              const icons = [<Zap key="z" size={20} className="text-cyan-400" />, <Shield key="s" size={20} className="text-purple-400" />, <Award key="a" size={20} className="text-pink-400" />];

              return (
                <GlassCard key={s.id} delay={0.25 + i * 0.05} className="!p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      {icons[i % 3]}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{s.title}</p>
                      <p className="text-[10px] text-slate-500">Map: {s.map} | {s.format}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">{dayLabel}</p>
                      <p className="text-sm font-black font-display text-white">{new Date(s.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</p>
                    </div>
                    <button className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg border transition-all ${
                      s.status === 'live' 
                        ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20' 
                        : s.status === 'scheduled' 
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' 
                        : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                    }`}>
                      {statusLabels[s.status] || 'PENDING'}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h3 className="text-xl font-black font-display tracking-tighter text-white mb-4">Announcements</h3>
          <GlassCard delay={0.3} className="!p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {(announcements.length > 0 ? announcements : [
                { id: 'a1', title: 'New Patch V8.00 Deployment', body: 'Mandatory update for all tournament rigs. Ensure local clients are updated before 18:00.', timeAgo: '2 HOURS AGO' },
                { id: 'a2', title: 'Zentrix India HQ Meetup', body: 'Official team photoshoot scheduled for next Friday at Mumbai Studio. Be ready by 10 AM.', timeAgo: 'YESTERDAY' },
                { id: 'a3', title: 'Boot Camp Schedule Released', body: 'November bootcamp confirmed in Bangalore. All squads required.', timeAgo: '3 DAYS AGO' },
              ]).slice(0, 3).map(ann => (
                <div key={ann.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400 mb-2 block">{ann.timeAgo}</span>
                  <h4 className="text-sm font-bold text-white mb-1">{ann.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/scrims')} className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-cyan-400 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2">
              <span className="opacity-70">View Full Calendar</span>
              <ChevronRight size={12} />
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Player Certifications */}
      <div className="mb-8">
        <h3 className="text-xl font-black font-display tracking-tighter text-white flex items-center gap-2 mb-2">
          <span className="w-4 h-0.5 bg-cyan-400 rounded"></span>
          Player Certifications
        </h3>
        <p className="text-xs text-slate-400 mb-6">Verified credentials and tournament achievements.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Tier-1 Pro License', date: 'Sept 2023', color: 'cyan' },
            { name: 'Masters Invitational Win', date: 'Jan 2024', color: 'purple' },
            { name: 'Tactical Analyst Cert', date: 'Mar 2024', color: 'green' },
          ].map((cert, i) => (
            <GlassCard key={i} delay={0.4 + i * 0.05} className={`!p-0 overflow-hidden h-40 relative group cursor-pointer border-${cert.color}-500/20`}>
              <div className={`absolute inset-0 bg-gradient-to-br from-${cert.color === 'cyan' ? 'cyan' : cert.color === 'purple' ? 'purple' : 'green'}-900/30 to-[#0A0A1A]`}></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                <Award size={28} className={`text-${cert.color === 'cyan' ? 'cyan' : cert.color === 'purple' ? 'purple' : 'green'}-400 mb-2`} />
                <div className="w-12 h-[1px] bg-white/20 mb-2"></div>
                <p className="text-[10px] font-black font-display text-white uppercase tracking-wider text-center">{cert.name}</p>
              </div>
            </GlassCard>
          ))}
          <GlassCard delay={0.55} className="!p-0 overflow-hidden h-40 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/30 transition-all group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 group-hover:border-cyan-400/30 transition-colors">
              <span className="text-xl text-slate-500 group-hover:text-cyan-400 transition-colors">+</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 group-hover:text-cyan-400 transition-colors">Upload New</span>
          </GlassCard>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { name: 'Tier-1 Pro License', date: 'Sept 2023' },
            { name: 'Masters Invitational Win', date: 'Jan 2024' },
            { name: 'Tactical Analyst Cert', date: 'Mar 2024' },
            {},
          ].map((cert, i) => (
            cert.name ? (
              <div key={i} className="text-center">
                <p className="text-xs font-black font-display text-white uppercase tracking-wider">{cert.name}</p>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mt-0.5">Verified: {cert.date}</p>
              </div>
            ) : <div key={i}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
