import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { PermissionGuard } from '../components/ui/PermissionGuard';
import { useCollection, useFirestoreAdd, useFirestoreUpdate, useFirestoreDelete } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { createUserAccount } from '../firebase/auth';
import { generateTempPassword } from '../utils/credentialGenerator';
import { CredentialDisplay } from '../components/users/CredentialDisplay';
import { ROLES } from '../utils/permissions';
import { GAMES } from '../utils/games';
import { Plus, Eye, X, Award, Medal, CheckCircle, Target, Crosshair, Trophy, UserMinus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Players() {
  const { data: allPlayers, loading } = useCollection('players');
  const { data: allTeams } = useCollection('teams');
  const { userDoc } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [viewPlayer, setViewPlayer] = useState(null);
  const [editPlayer, setEditPlayer] = useState(null);
  const { update } = useFirestoreUpdate('players');

  const players = React.useMemo(() => {
    if (userDoc?.role === ROLES.GAME_TEAM_MANAGER && userDoc?.game) {
      return allPlayers.filter(p => p.game === userDoc.game);
    }
    return allPlayers;
  }, [allPlayers, userDoc]);

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
          <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase mb-2 block">Global Division</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">PLAYERS<span className="text-cyan-400">.</span>CORE</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <PermissionGuard permission="add_teams">
            <Link to="/teams">
              <NeonButton>
                <Trophy size={18} /> Create Team
              </NeonButton>
            </Link>
          </PermissionGuard>
          <PermissionGuard permission="add_players">
            <NeonButton variant="secondary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Create Roster
            </NeonButton>
          </PermissionGuard>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden border border-white/5">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Player</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Game Tag</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Game</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Team</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">K/D</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan="8" className="text-center py-8 text-cyan-400">Loading DB...</td></tr>}
              {!loading && players.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-slate-500">No players registered.</td></tr>}
              {players.map(player => {
                const team = teams.find(t => t.id === player.teamId);
                return (
                  <tr key={player.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setViewPlayer(player)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${player.ign}&background=0A0A1A&color=00F5FF&size=40`} alt={player.ign} className="w-full h-full rounded-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight">{player.displayName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-display text-xs font-bold text-cyan-400 uppercase tracking-widest">{player.ign}</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{player.game}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{team ? team.name : 'Free Agent'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/10 uppercase tracking-tighter">
                        {player.role || 'Player'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black font-display text-cyan-400">{player.stats?.kd || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${player.isActive ? 'bg-green-500 shadow-green-500' : 'bg-slate-600 shadow-slate-600'}`}></span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${player.isActive ? 'text-green-500' : 'text-slate-600'}`}>
                          {player.isActive ? 'Active' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={(e) => { e.stopPropagation(); setViewPlayer(player); }} className="p-2 hover:bg-cyan-400/20 rounded-lg text-slate-400 hover:text-cyan-400 transition-all">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      {showModal && <AddPlayerModal onClose={() => setShowModal(false)} teams={teams} />}
      {viewPlayer && <PlayerProfileModal player={viewPlayer} onClose={() => setViewPlayer(null)} onEdit={() => { setViewPlayer(null); setEditPlayer(viewPlayer); }} />}
      {editPlayer && <EditPlayerModal player={editPlayer} onClose={() => setEditPlayer(null)} update={update} />}
    </div>
  );
}

// ── Player Profile Modal (Screenshot 5) ──
function PlayerProfileModal({ player, onClose, onEdit }) {
  const { data: tournaments } = useCollection('tournaments');
  const playerTournaments = tournaments.filter(t => t.status === 'completed').slice(0, 2);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-3xl relative z-10 animate-fade-up" onClick={e => e.stopPropagation()}>
        <GlassCard elevated className="p-0 overflow-hidden border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Profile Pane */}
            <div className="md:col-span-4 p-8 flex flex-col items-center border-r border-white/5 bg-gradient-to-b from-slate-950 to-[#050510]">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-2 border-cyan-400 p-1 overflow-hidden shadow-[0_0_30px_rgba(0,245,255,0.3)] bg-slate-900">
                  <img src={`https://ui-avatars.com/api/?name=${player.ign}&background=050510&color=00F5FF&size=200&font-size=0.35`} alt={player.ign} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-cyan-400 rounded-full border-4 border-[#0A0A1A] flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.5)]">
                  <CheckCircle size={12} className="text-[#0A0A1A]" />
                </div>
              </div>
              <h2 className="text-2xl font-black font-display tracking-tighter text-white uppercase">{player.ign}</h2>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-6">{player.displayName}</p>

              <div className="w-full space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Nationality</span>
                  <span className="text-xs font-black font-display text-white">INDIA 🇮🇳</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Game</span>
                  <span className="text-xs font-black font-display text-white">{player.game}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Preferred</span>
                  <span className="text-xs font-black font-display text-white">{player.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Team Salary</span>
                  <span className="text-xs font-black font-display text-green-400">₹{player.salary ? player.salary.toLocaleString('en-IN') : 0}</span>
                </div>
              </div>

              <div className="w-full mt-auto space-y-2">
                <button onClick={onEdit} className="w-full py-3 border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  Edit Profile
                </button>
                <PermissionGuard permission="delete_players">
                  <TerminateButton player={player} onClose={onClose} />
                </PermissionGuard>
              </div>
            </div>

            {/* Right Content */}
            <div className="md:col-span-8 p-8 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
              
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-1 block">Performance Dashboard</span>
              <h3 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">COMBAT METRICS</h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-400/30 transition-colors">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">K/D Ratio</p>
                  <p className="text-3xl font-black font-display text-white">{player.stats?.kd || '—'}</p>
                  <p className="text-[10px] font-bold text-green-400">+0.12 vs avg</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-400/30 transition-colors">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Accuracy</p>
                  <p className="text-3xl font-black font-display text-white">{player.stats?.accuracy || 0}%</p>
                  <p className="text-[10px] font-bold text-slate-400">Global Top 1%</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-400/30 transition-colors">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Clutch Rate</p>
                  <p className="text-3xl font-black font-display text-white">{player.stats?.clutchRate || 0}%</p>
                  <p className="text-[10px] font-bold text-cyan-400">Rising Stat</p>
                </div>
              </div>

              {/* Tournament History */}
              <h4 className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Tournament History
              </h4>
              <div className="space-y-3 mb-8">
                {playerTournaments.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                        <Award size={18} className="text-yellow-500" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white">{t.name}</h5>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">{t.placements?.first === player.teamId || t.placements?.first ? '1st Place • MVP' : '3rd Place'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black font-display tracking-widest text-cyan-400 uppercase">
                      {t.placements?.first ? 'Winner' : 'Finals'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <h4 className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Verified Certifications
              </h4>
              <div className="flex gap-4">
                <div className="flex-1 h-24 rounded-xl border border-cyan-500/30 relative overflow-hidden flex items-end p-3 group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-[#0A0A1A]"></div>
                  <div className="relative z-10">
                    <h5 className="text-[10px] font-black font-display text-white uppercase tracking-wider mb-0.5">Reflex Mastery</h5>
                    <p className="text-[8px] font-bold text-cyan-400 tracking-[0.2em] uppercase">Global Elite Verified</p>
                  </div>
                </div>
                <div className="flex-1 h-24 rounded-xl border border-pink-500/30 relative overflow-hidden flex items-end p-3 group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-bl from-pink-900/40 to-[#0A0A1A]"></div>
                  <div className="relative z-10">
                    <h5 className="text-[10px] font-black font-display text-white uppercase tracking-wider mb-0.5">Leadership Cert</h5>
                    <p className="text-[8px] font-bold text-pink-400 tracking-[0.2em] uppercase">Level 5 Team Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Add Player Modal ──
function AddPlayerModal({ onClose, teams }) {
  const { user, userDoc } = useAuth();
  const [step, setStep] = useState('form');
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ 
    displayName: '', 
    ign: '', 
    email: '', 
    game: 'BGMI', 
    teamId: '', 
    inGameRole: 'Assaulter' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName || !form.ign) return toast.error('Name & IGN required');
    if (!form.email) return toast.error('Agent Email required for credentials');
    
    setLoading(true);
    try {
      const tempPassword = generateTempPassword(form.ign);
      const email = form.email.includes('@') ? form.email : `${form.email.toLowerCase().replace(/[^a-z0-9.]/g, '')}@zentrixesports.com`;

      const result = await createUserAccount({
        email,
        password: tempPassword,
        displayName: form.displayName,
        ign: form.ign,
        inGameRole: form.inGameRole,
        role: ROLES.PLAYER,
        game: form.game,
        teamId: form.teamId || null,
        createdByUid: user.uid,
        createdByName: userDoc.displayName,
        createdByEmail: userDoc.email,
      });

      setCredentials({
        email: result.email,
        password: tempPassword,
        displayName: result.displayName,
        role: result.role,
      });

      setStep('credentials');
      toast.success('Player registered and credentials generated!');

    } catch (err) {
      console.error(err);
      toast.error('Failed to register player: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'credentials') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
        <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
          <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">Player Credentials</h2>
          <CredentialDisplay credentials={credentials} onDone={onClose} />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
        <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">RECRUIT PLAYER</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Real Name</label>
            <input required value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Agent Email / Prefix</label>
            <input required type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="john or john@zentrixesports.com" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">In-Game Name (IGN)</label>
            <input required value={form.ign} onChange={e => setForm({ ...form, ign: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm font-display text-cyan-400" placeholder="DEMON_99" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Team Assignment</label>
              <select value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                <option value="">Free Agent</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Game</label>
              <select value={form.game} onChange={e => setForm({ ...form, game: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">In-Game Role</label>
            <input value={form.inGameRole} onChange={e => setForm({ ...form, inGameRole: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="IGL / Assaulter / Fragger" />
          </div>
          <div className="flex gap-4 pt-4">
            <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
            <NeonButton type="submit" disabled={loading} className="flex-1">Generate Credentials</NeonButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

// ── Terminate Button Sub-component ──
function TerminateButton({ player, onClose }) {
  const { update, loading: terminating } = useFirestoreUpdate('players');
  const { remove, loading: deleting } = useFirestoreDelete('players');

  const handleTerminate = async () => {
    if (window.confirm(`Are you absolutely sure you want to terminate ${player.ign}?\nThis action will mark them as inactive.`)) {
      await update(player.id, { isActive: false });
      toast.success(`${player.ign} has been terminated.`);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`🚨 CRITICAL ACTION 🚨\nAre you absolutely sure you want to PERMANENTLY DELETE ${player.ign} from the database?\n\nThis action CANNOT be undone.`)) {
      await remove(player.id);
      toast.success(`${player.ign} permanently erased from existence.`);
      onClose();
    }
  };

  const loading = terminating || deleting;

  return (
    <div className="flex flex-col gap-2 w-full">
      {player.isActive ? (
        <button 
          onClick={handleTerminate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 border border-orange-500/30 rounded-xl text-xs font-bold tracking-widest uppercase text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 transition-all">
          <UserMinus size={16} /> Terminate Player
        </button>
      ) : (
        <button disabled className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 rounded-xl text-xs font-bold tracking-widest uppercase text-slate-600 cursor-not-allowed">
            <UserMinus size={16} /> Terminated
        </button>
      )}

      {/* Hard Delete Button */}
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs font-bold tracking-widest uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all">
        <Trash2 size={16} /> Permanently Delete
      </button>
    </div>
  );
}

function EditPlayerModal({ player, onClose, update }) {
  const [form, setForm] = useState({ ign: player.ign, game: player.game, role: player.role, salary: player.salary || 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ign) return toast.error('IGN required');
    setLoading(true);
    try {
      await update(player.id, form);
      toast.success('Player Info Updated!');
      onClose();
    } catch { toast.error('Update failed'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-sm relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">EDIT PLAYER</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">In-Game Name</label>
              <input value={form.ign} onChange={e=>setForm({...form, ign: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assigned Game</label>
              <select value={form.game} onChange={e=>setForm({...form, game: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                 {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Role / Position</label>
              <input value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Ex: IGL / Entry Fragger" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest block mb-1">Team Salary (₹)</label>
              <input type="number" value={form.salary} onChange={e=>setForm({...form, salary: Number(e.target.value)})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Ex: 5000" />
            </div>
            <div className="flex gap-4 pt-4">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="submit" disabled={loading} className="flex-1">Save Changes</NeonButton>
            </div>
         </form>
       </GlassCard>
    </div>
  );
}
