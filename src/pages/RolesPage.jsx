import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { useAuth } from '../hooks/useAuth';
import { useCollection, useFirestoreAdd, useFirestoreUpdate } from '../hooks/useFirestore';
import { createUserAccount } from '../firebase/auth';
import { generateTempPassword } from '../utils/credentialGenerator';
import { CredentialDisplay } from '../components/users/CredentialDisplay';
import { ROLES, ROLE_LABELS, getDefaultPermissions } from '../utils/permissions';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { GAMES } from '../utils/games';
import { ShieldCheck, ShieldAlert, KeyRound, Copy, UserPlus, Users, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RolesPage() {
  const { userDoc } = useAuth();
  const { data: invites } = useCollection('invites');
  const { data: users } = useCollection('users');
  const { add: addInvite, loading: inviteLoading } = useFirestoreAdd('invites');
  const { update: updateUser } = useFirestoreUpdate('users');
  
  const isOwner = userDoc?.role === 'owner';
  const isManager = userDoc?.role === 'manager' || isOwner;

  // Team Manager Provisioning State
  const [mgrName, setMgrName] = useState('');
  const [mgrGame, setMgrGame] = useState('BGMI');
  
  // Player Invite State
  const [inviteGame, setInviteGame] = useState(userDoc?.game || 'BGMI');

  // Role Assignment State
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const handleCreateTeamManager = async (e) => {
    e.preventDefault();
    if (!mgrName) return toast.error('Name required');
    const email = `${mgrName.toLowerCase().replace(/\s/g, '')}@zentrixesports.com`;
    const password = generateTempPassword(mgrName);

    setProvisionLoading(true);
    try {
      const result = await createUserAccount({
        email,
        password,
        displayName: mgrName,
        role: ROLES.GAME_TEAM_MANAGER,
        game: mgrGame,
        createdByUid: userDoc.uid,
        createdByName: userDoc.displayName,
        createdByEmail: userDoc.email,
      });

      setCreatedCredentials({
        email: result.email,
        password: password,
        displayName: result.displayName,
        role: ROLES.GAME_TEAM_MANAGER,
      });
      
      toast.success('Team Manager Provisioned Successfully!');
      setMgrName('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to provision team manager');
    } finally {
      setProvisionLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    const code = 'ZX-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    await addInvite({
      code,
      createdBy: userDoc.uid,
      game: isOwner ? inviteGame : userDoc.game,
      roleAssigned: 'player',
      permissions: ['view_players', 'view_tournaments'],
      status: 'active',
      createdAt: Date.now()
    });
    toast.success(`Clearance Code Generated: ${code}`);
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        permissions: getDefaultPermissions(newRole),
        updatedAt: Date.now()
      });
      toast.success(`Role updated to ${ROLE_LABELS[newRole] || newRole}`);
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error('Failed to update role');
    }
  };

  if (!isManager) {
    return (
      <div className="animate-fade-up">
        <GlassCard className="text-center py-20 flex flex-col items-center">
          <ShieldAlert size={64} className="text-pink-500 mb-6" />
          <h2 className="text-xl font-bold font-display text-white uppercase tracking-widest">Access Restricted</h2>
          <p className="text-sm text-slate-400 mt-2">Only level 4+ (Managers/Owners) can access the Provisioning Hub.</p>
        </GlassCard>
      </div>
    );
  }

  // Get non-owner users for role management
  const manageableUsers = users.filter(u => u.role !== 'owner');

  return (
    <div className="animate-fade-up">
      <div className="mb-12">
        <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase mb-2 block">System Configuration</span>
        <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">ACCESS PROVISIONING</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* PLAYER INVITES */}
        <GlassCard className="border-t-4 border-t-pink-500">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound size={24} className="text-pink-500" />
            <h2 className="text-xl font-bold font-display text-white tracking-widest uppercase">Generate Invite Code</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-medium">Create secure access codes for athletes to register and join the platform.</p>
          
          {isOwner && (
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assign Game Domain</label>
              <select value={inviteGame} onChange={e => setInviteGame(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
          )}

          <NeonButton onClick={handleGenerateInvite} disabled={inviteLoading} variant="danger" className="w-full">
            Generate New Code
          </NeonButton>

          <div className="mt-8 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Active Codes</h3>
            {invites.filter(i => i.status === 'active').length === 0 && <p className="text-xs text-slate-600">No active codes.</p>}
            {invites.filter(i => i.status === 'active').map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <span className="font-display font-black text-pink-400 tracking-widest">{inv.code}</span>
                  <p className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">Domain: {inv.game}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(inv.code); toast.success('Copied!'); }} className="text-slate-400 hover:text-white transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* TEAM MANAGER PROVISIONING */}
        <GlassCard className="border-t-4 border-t-cyan-400 h-full">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={24} className="text-cyan-400" />
            <h2 className="text-xl font-bold font-display text-white tracking-widest uppercase">Provision Team Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-medium">Create direct terminal access for Team Managers. They can manage players, teams, scrims, and certificates for their assigned game.</p>
          
          <form onSubmit={handleCreateTeamManager} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Team Manager Name</label>
              <input value={mgrName} onChange={e => setMgrName(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Ex: Arjun" />
              <p className="text-[9px] text-cyan-400 tracking-widest mt-1">Email will be auto-generated.</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Game Domain</label>
              <select value={mgrGame} onChange={e => setMgrGame(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div className="pt-2">
              <NeonButton type="submit" disabled={provisionLoading} className="w-full">
                <UserPlus size={16} /> 
                {provisionLoading ? 'Provisioning...' : 'Provision Credentials'}
              </NeonButton>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Role Assignment Section */}
      {manageableUsers.length > 0 && (
        <GlassCard className="border-t-4 border-t-purple-500">
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-purple-400" />
            <h2 className="text-xl font-bold font-display text-white tracking-widest uppercase">Manage User Roles</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-medium">Assign or change roles for registered users. Changes take effect immediately.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Game</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {manageableUsers.map(u => (
                  <tr key={u.id || u.uid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-white">{u.displayName}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${
                        u.role === 'manager' ? 'bg-cyan-400/10 text-cyan-400' : 
                        u.role === 'game_team_manager' ? 'bg-purple-400/10 text-purple-400' :
                        'bg-slate-400/10 text-slate-400'
                      }`}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">{u.game || '—'}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={u.role} 
                        onChange={e => handleChangeRole(u.id || u.uid, e.target.value)} 
                        className="input-glass rounded-lg px-3 py-1.5 text-xs"
                      >
                        <option value="player">Player</option>
                        <option value="game_team_manager">Team Manager</option>
                        <option value="manager">Esports Manager</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
            <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">Team Manager Credentials</h2>
            <CredentialDisplay credentials={createdCredentials} onDone={() => setCreatedCredentials(null)} />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
