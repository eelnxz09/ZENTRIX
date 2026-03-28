import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { PermissionGuard } from '../components/ui/PermissionGuard';
import { useCollection, useFirestoreAdd } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/permissions';
import { GAMES } from '../utils/games';
import { Plus, Users, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Teams() {
  const { data: allTeams, loading } = useCollection('teams');
  const { userDoc } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const teams = React.useMemo(() => {
    if (userDoc?.role === ROLES.GAME_TEAM_MANAGER && userDoc?.game) {
      return allTeams.filter(t => t.game === userDoc.game);
    }
    return allTeams;
  }, [allTeams, userDoc]);

  return (
    <div className="animate-fade-up">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400 mb-2 block">Organization Hub</span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">TEAMS</h1>
          <p className="text-slate-400 max-w-md mt-4 font-light leading-relaxed">
            Manage active rosters, track performance metrics, and orchestrate top-tier competitive play.
          </p>
        </div>
        
        <PermissionGuard permission="add_teams">
          <NeonButton onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Team
          </NeonButton>
        </PermissionGuard>
      </div>

      {loading ? (
        <div className="text-cyan-400 flex py-12 justify-center"><div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div></div>
      ) : teams.length === 0 ? (
        <GlassCard className="text-center py-12">
            <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No teams found. Create your first roster.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map(team => (
            <GlassCard key={team.id} className="group relative">
               <div className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl group-hover:bg-cyan-400/10 transition-colors"></div>
               <div className="flex justify-between items-start mb-6">
                 <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 uppercase font-display text-2xl font-black text-white p-2 text-center break-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {team.name.substring(0, 2)}
                 </div>
                 <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase text-cyan-400 border border-white/10">{team.game}</span>
               </div>
               <h3 className="text-2xl font-black font-display mb-2 text-white tracking-tight uppercase">{team.name}</h3>
               
               <div className="flex items-center gap-2 mb-6 text-slate-400">
                  <Users size={16} />
                  <span className="text-xs font-medium uppercase tracking-tighter">{team.playerIds?.length || 0} Players Active</span>
               </div>

               <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Matches</span>
                    <span className="text-white">{team.totalMatches || 0}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Wins</span>
                    <span className="text-green-400">{team.wins || 0}</span>
                 </div>
               </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showModal && <AddTeamModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function AddTeamModal({ onClose }) {
  const [name, setName] = useState('');
  const [game, setGame] = useState('BGMI');
  const { add, loading } = useFirestoreAdd('teams');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name || !game) return toast.error('Fill required fields');
    await add({ name, game, playerIds: [], wins: 0, losses: 0, totalMatches: 0, status: 'active' });
    toast.success('Team Created!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">NEW TEAM</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Roster Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Zentrix Alpha" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Primary Game</label>
              <select value={game} onChange={e=>setGame(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                 {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex gap-4 pt-4">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="submit" disabled={loading} className="flex-1">Create</NeonButton>
            </div>
         </form>
       </GlassCard>
    </div>
  );
}
