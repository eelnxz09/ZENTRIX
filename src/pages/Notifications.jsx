import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { useCollection, useFirestoreAdd } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { ROLES } from '../utils/permissions';
import { BellRing, Send, AlertCircle, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { data: notifications, loading } = useCollection('notifications');
  const [showModal, setShowModal] = useState(false);
  const { role } = useRole();
  const { user, userDoc } = useAuth();
  const { add } = useFirestoreAdd('notifications');
  
  // Owners and Managers (and Team Managers) can send broadcasts
  const canSend = [ROLES.OWNER, ROLES.MANAGER, ROLES.GAME_TEAM_MANAGER].includes(role);

  const handleSend = async (message, type) => {
    try {
      await add({
        message,
        type,
        senderId: user.uid,
        senderName: userDoc?.displayName || user.displayName || 'System',
        senderRole: role,
        timestamp: Date.now()
      });
      toast.success("Broadcast sent!");
      setShowModal(false);
    } catch(err) {
      toast.error("Failed to send broadcast");
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-pink-500 uppercase mb-2 block">Comms Center</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">UPDATES & ALERTS</h1>
        </div>
        
        {canSend && (
          <NeonButton onClick={() => setShowModal(true)}>
             <Send size={18} /> Broadcast Message
          </NeonButton>
        )}
      </div>

      <div className="space-y-4 max-w-4xl">
         {loading ? (
             <div className="flex justify-center py-12 text-cyan-400">
             <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
             </div>
         ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs">No Recent Comms</div>
         ) : notifications.sort((a,b)=>b.timestamp - a.timestamp).map(n => (
            <GlassCard key={n.id} elevated className={`relative overflow-hidden group p-6 border-l-4 ${n.type === 'alert' ? 'border-l-red-500' : n.type === 'success' ? 'border-l-green-500' : 'border-l-cyan-500'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${n.type === 'alert' ? 'text-red-400' : n.type === 'success' ? 'text-green-400' : 'text-cyan-400'}`}>
                       {n.type === 'alert' ? <AlertCircle size={24} /> : n.type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <p className="text-white font-bold text-lg">{n.senderName}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{n.senderRole}</p>
                           </div>
                           <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                               {new Date(n.timestamp).toLocaleDateString()} {new Date(n.timestamp).toLocaleTimeString()}
                           </span>
                        </div>
                        <p className="text-slate-300">{n.message}</p>
                    </div>
                </div>
            </GlassCard>
         ))}
      </div>

      {showModal && <BroadcastModal onClose={() => setShowModal(false)} onSend={handleSend} />}
    </div>
  );
}

function BroadcastModal({ onClose, onSend }) {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('info');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6 flex items-center gap-2"><BellRing className="text-pink-500"/> SYSTEM BROADCAST</h2>
         
         <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Alert Level</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm font-bold text-white">
                 <option value="info">Info (Cyan)</option>
                 <option value="success">Success (Green)</option>
                 <option value="alert">Critical Alert (Red)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Message Payload</label>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows="4" className="w-full input-glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600" placeholder="Type announcement here..." />
            </div>
            
            <div className="flex gap-4 pt-4">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="button" disabled={!msg} onClick={() => onSend(msg, type)} variant="danger" className="flex-1">Deploy Push</NeonButton>
            </div>
         </div>
       </GlassCard>
    </div>
  );
}
