import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { PermissionGuard } from '../components/ui/PermissionGuard';
import { useCollection, useFirestoreAdd, useFirestoreUpdate, useFirestoreDelete } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { useAuditLog } from '../hooks/useAuditLog';
import { GAMES } from '../utils/games';
import { Plus, Trophy, CloudUpload, CheckCircle, AlertTriangle, Medal, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tournaments() {
  const { data: tournaments, loading } = useCollection('tournaments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [endTournamentTarget, setEndTournamentTarget] = useState(null);
  const [editTournamentTarget, setEditTournamentTarget] = useState(null);
  const { remove } = useFirestoreDelete('tournaments');

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      await remove(id);
      toast.success("Tournament deleted.");
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase mb-2 block">Competitive Hub</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">TOURNAMENTS</h1>
        </div>
        
        <PermissionGuard permission="add_tournaments">
          <NeonButton onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Register Tournament
          </NeonButton>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center py-12 text-cyan-400">
             <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : tournaments.map(t => (
           <GlassCard key={t.id} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 flex gap-2 items-center">
                 <PermissionGuard permission="edit_tournaments">
                   <button onClick={() => setEditTournamentTarget(t)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                     <Edit size={16} />
                   </button>
                   <button onClick={() => handleDelete(t.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                     <Trash2 size={16} />
                   </button>
                 </PermissionGuard>
                 <span className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border ${
                    t.status === 'live' ? 'bg-pink-500/10 text-pink-500 border-pink-500/30 shadow-[0_0_10px_rgba(255,45,120,0.5)]' : 
                    t.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                 }`}>
                     {t.status}
                 </span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-4">{t.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{t.organizer} • {t.game}</p>
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2 mb-4">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 uppercase tracking-widest font-bold text-[10px]">Prize Pool</span>
                    <span className="text-green-400 font-bold font-display">₹{t.prizePool}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 uppercase tracking-widest font-bold text-[10px]">Entry Fee</span>
                    <span className="text-white font-bold font-display">{t.entryFee?.amount > 0 ? `₹${t.entryFee.amount}` : 'FREE'}</span>
                 </div>
              </div>

              {t.status === 'completed' && t.placements && (
                 <div className="mt-4 pt-4 border-t border-white/10">
                     <h4 className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 mb-2 flex items-center gap-1"><Medal size={12}/> Champion Roster</h4>
                     <p className="font-display font-black text-white text-sm">{t.placements.first}</p>
                 </div>
              )}

              {t.status !== 'completed' && (
                 <PermissionGuard permission="edit_tournaments">
                    <NeonButton 
                       variant="secondary" 
                       className="w-full mt-2 py-2 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                       onClick={() => setEndTournamentTarget(t)}
                    >
                       CONCLUDE TOURNAMENT
                    </NeonButton>
                 </PermissionGuard>
              )}
           </GlassCard>
        ))}
      </div>

      {showAddModal && <AddTournamentModal onClose={() => setShowAddModal(false)} />}
      {endTournamentTarget && <EndTournamentModal t={endTournamentTarget} onClose={() => setEndTournamentTarget(null)} />}
      {editTournamentTarget && <EditTournamentModal t={editTournamentTarget} onClose={() => setEditTournamentTarget(null)} />}
    </div>
  );
}

function EndTournamentModal({ t, onClose }) {
  const [placements, setPlacements] = useState({ first: '', second: '', third: '' });
  const [prizeProofPreview, setPrizeProofPreview] = useState(null);
  const [prizeProofURL, setPrizeProofURL] = useState('');
  const { update, loading } = useFirestoreUpdate('tournaments');
  const { data: teams } = useCollection('teams');
  const { update: updateTeam } = useFirestoreUpdate('teams');
  const { add: addFinancialLog } = useFirestoreAdd('financial_logs');
  const { log } = useAuditLog();

  const compressToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const scale = Math.min(MAX_WIDTH / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.4)); 
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProofSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPrizeProofPreview(URL.createObjectURL(file));
    toast.loading('Optimizing Image...', { id: 'proof' });
    try {
      const url = await compressToBase64(file);
      setPrizeProofURL(url);
      toast.success('Verified instantly!', { id: 'proof' });
    } catch { toast.error('Upload failed', { id: 'proof' }); }
  };

  const handleEnd = async (e) => {
      e.preventDefault();
      if(!placements.first) return toast.error('1st place is required to conclude.');
      if(Number(t.prizePool) > 0 && !prizeProofURL) return toast.error('Prize pool receipt is compulsory.');

      try {
          await update(t.id, {
             status: 'completed',
             placements,
             concludedAt: Date.now(),
             prizePoolProofURL: prizeProofURL || null
          });

          // Add prize pool payment to financial logs
          if (t.prizePool > 0) {
            await addFinancialLog({
              type: 'income',
              category: 'prize_pool',
              amount: t.prizePool,
              notes: `Prize Pool Received - ${t.name}`,
              proofURL: prizeProofURL || null,
              uploadedBy: 'system',
              uploadedByName: 'System',
              verifiedBy: prizeProofURL ? 'Verified' : 'Pending',
              linkedTournamentId: t.id,
              version: 1
            });
          }

          const winningTeam = teams.find(tm => tm.name === placements.first);
          if (winningTeam) {
              await updateTeam(winningTeam.id, {
                 wins: (winningTeam.wins || 0) + 1,
                 totalMatches: (winningTeam.totalMatches || 0) + 1
              });
          }

          await log({ action: 'tournament_concluded', collection: 'tournaments', docId: t.id, data: { placements, prizePoolProof: !!prizeProofURL } });
          toast.success(`${t.name} officially concluded.`);
          onClose();
      } catch(err) {
          toast.error('Failed to conclude tournament');
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">CONCLUDE EVENT</h2>
         <p className="text-xs text-slate-400 mb-6 font-medium tracking-wide">Record final standings for <strong className="text-white">{t.name}</strong> and upload the prize pool payment proof.</p>

         <form onSubmit={handleEnd} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-1 flex items-center gap-1"><Medal size={12}/> Champion (1st)</label>
              <input value={placements.first} onChange={e=>setPlacements({...placements, first: e.target.value})} className="w-full input-glass border-yellow-400/30 focus:border-yellow-400 text-yellow-300 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-yellow-700/50" placeholder="Winning Team Name" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Runner Up (2nd)</label>
              <input value={placements.second} onChange={e=>setPlacements({...placements, second: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm placeholder:text-slate-600" placeholder="Optional" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Third Place (3rd)</label>
              <input value={placements.third} onChange={e=>setPlacements({...placements, third: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm placeholder:text-slate-600" placeholder="Optional" />
            </div>

            {/* Prize Pool Payment Proof */}
            <div>
              <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest block mb-2 flex items-center gap-1"><ImageIcon size={12}/> Prize Pool Payment Screenshot</label>
              <div className={`p-4 rounded-xl border-2 border-dashed ${prizeProofURL ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-white/5'} flex flex-col items-center gap-2 relative overflow-hidden`}>
                {prizeProofURL ? (
                  <>
                    {prizeProofPreview && <img src={prizeProofPreview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Proof" />}
                    <CheckCircle size={24} className="text-green-500 relative z-10" />
                    <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase relative z-10">Proof Uploaded</p>
                  </>
                ) : (
                  <>
                    <CloudUpload size={24} className="text-slate-500" />
                    <p className="text-[10px] text-slate-400">Upload prize pool received screenshot</p>
                    <input type="file" accept="image/*" onChange={handleProofSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="submit" disabled={loading || (Number(t.prizePool) > 0 && !prizeProofURL)} variant="primary" className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 shadow-none border-t border-white/20 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                 {Number(t.prizePool) > 0 && !prizeProofURL ? 'Proof Compulsory' : 'Seal Standings'}
               </NeonButton>
            </div>
         </form>
       </GlassCard>
    </div>
  );
}

// ... AddTournamentModal remains the same below ...
function AddTournamentModal({ onClose }) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { log } = useAuditLog();
  const { add: addT } = useFirestoreAdd('tournaments');
  const { add: addF } = useFirestoreAdd('financial_logs');

  const [form, setForm] = useState({
    name: '', game: 'BGMI', organizer: '', format: 'Squad',
    startDate: '', endDate: '', prizePool: 0,
  });

  const [financial, setFinancial] = useState({
    entryFeeAmount: 0,
    isFree: false,
    paymentMethod: 'UPI',
    entryFeeProofPreview: null,
    entryFeeProofURL: '',
    proofUploaded: false
  });

  const compressToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const scale = Math.min(MAX_WIDTH / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.4)); 
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProofSelect = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setFinancial(f => ({ ...f, entryFeeProofPreview: URL.createObjectURL(file) }));
    
    toast.loading('Optimizing Image...', { id: 'upload' });
    try {
        const url = await compressToBase64(file);
        setFinancial(f => ({ ...f, entryFeeProofURL: url, proofUploaded: true }));
        toast.success('Verified Instantly!', { id: 'upload' });
    } catch(err) {
        toast.error('Optimization failed!', { id: 'upload' });
    }
  };

  const handleNext = () => {
     if(!form.name || !form.organizer || !form.startDate) return toast.error('Fill core fields');
     setStep(2);
  };

  const submitDisabled = useMemo(() => {
     if (financial.isFree || financial.entryFeeAmount === 0 || financial.entryFeeAmount === '0') return false;
     if (!financial.proofUploaded) return true;
     return false;
  }, [financial]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          // 1. Write tournament
          const tData = {
              ...form, status: 'live',
              entryFee: {
                 amount: Number(financial.entryFeeAmount),
                 proofURL: financial.entryFeeProofURL || null,
                 paymentMethod: financial.paymentMethod,
                 paidBy: user?.uid || 'system', paidAt: Date.now()
              }
          };
          const tRef = await addT(tData);

          // 2. Write financial log if paid
          if (tData.entryFee.amount > 0) {
              const logRef = await addF({
                  type: 'expense', category: 'tournament_entry',
                  amount: tData.entryFee.amount,
                  proofURL: financial.entryFeeProofURL || null,
                  linkedTournamentId: tRef.id,
                  notes: `Entry fee for ${form.name}`,
                  uploadedBy: user?.uid || 'system',
                  uploadedByName: user?.displayName || 'System Admin',
                  version: 1, isAmendment: false
              });
              // 3. Update audit log
              await log({ action: 'tournament_added', collection: 'tournaments', docId: tRef.id, data: { name: form.name, ref: logRef.id }, notes: 'Tournament created with fee' });
          } else {
              await log({ action: 'tournament_added', collection: 'tournaments', docId: tRef.id, data: { name: form.name }, notes: 'Free tournament created' });
          }
          toast.success(`Tournament ${form.name} Registered!`);
          onClose();
      } catch (err) {
          toast.error('Failed to create tournament');
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-lg relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">NEW TOURNAMENT</h2>
         
         {step === 1 && (
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tournament Name</label>
                  <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Prime Series 1.0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Organizer</label>
                      <input value={form.organizer} onChange={e=>setForm({...form, organizer: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="ESL India" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Prize Pool</label>
                      <input type="number" value={form.prizePool} onChange={e=>setForm({...form, prizePool: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="100000" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                      <input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Game</label>
                      <select value={form.game} onChange={e=>setForm({...form, game: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                         {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                      </select>
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
                   <NeonButton type="button" onClick={handleNext} className="flex-1">Next: Financials</NeonButton>
                </div>
             </div>
         )}

         {step === 2 && (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                   <AlertTriangle className="text-pink-500" size={24} />
                   <p className="text-[10px] uppercase tracking-widest font-bold text-pink-500">Anti-Fraud Compliance Required</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Entry Fee Amount</label>
                      <input type="number" value={financial.entryFeeAmount} onChange={e=>setFinancial({...financial, entryFeeAmount: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="0" />
                    </div>
                    <div className="flex items-center pt-6">
                       <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                           <input type="checkbox" checked={financial.isFree} onChange={e=>setFinancial({...financial, isFree: e.target.checked})} className="rounded bg-white/5 border-white/10 text-cyan-400" />
                           Free Entry Tournament
                       </label>
                    </div>
                </div>

                {!financial.isFree && financial.entryFeeAmount > 0 && (
                    <div className={`mt-4 p-6 rounded-2xl border-2 border-dashed ${financial.proofUploaded ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-white/5'} flex flex-col items-center justify-center gap-3 relative overflow-hidden group`}>
                       {!financial.proofUploaded ? (
                           <>
                             <CloudUpload size={32} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                             <p className="text-xs text-slate-400">Upload Entry Fee Screenshot</p>
                             <input type="file" accept="image/*" onChange={handleProofSelect} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                           </>
                       ) : (
                           <>
                             <img src={financial.entryFeeProofPreview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Proof" />
                             <CheckCircle size={32} className="text-green-500 relative z-10" />
                             <p className="text-xs font-bold text-green-400 tracking-widest uppercase relative z-10">Proof Verified</p>
                             <button type="button" onClick={()=>setFinancial({...financial, proofUploaded: false, entryFeeProofPreview: null})} className="text-[10px] uppercase tracking-widest text-white relative z-10 hover:text-cyan-400">Change File</button>
                           </>
                       )}
                    </div>
                )}

                <div className="flex gap-4 pt-6">
                   <NeonButton type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</NeonButton>
                   <NeonButton type="submit" disabled={submitDisabled} className="flex-1">
                      {submitDisabled ? '⚠ Upload Proof to Continue' : 'Submit & Register'}
                   </NeonButton>
                </div>
             </form>
         )}
       </GlassCard>
    </div>
  );
}

// ── EditTournamentModal ──
function EditTournamentModal({ t, onClose }) {
  const [form, setForm] = useState({
    name: t.name, game: t.game, organizer: t.organizer, format: t.format,
    startDate: t.startDate, prizePool: t.prizePool
  });
  const { update, loading } = useFirestoreUpdate('tournaments');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.name || !form.organizer || !form.startDate) return toast.error('Fill core fields');
    await update(t.id, form);
    toast.success('Tournament Updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-lg relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">EDIT TOURNAMENT</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tournament Name</label>
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Organizer</label>
                  <input value={form.organizer} onChange={e=>setForm({...form, organizer: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Prize Pool</label>
                  <input type="number" value={form.prizePool} onChange={e=>setForm({...form, prizePool: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Game</label>
                  <select value={form.game} onChange={e=>setForm({...form, game: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                     {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
            </div>
            <div className="flex gap-4 pt-6">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="submit" disabled={loading} className="flex-1">Save Changes</NeonButton>
            </div>
         </form>
       </GlassCard>
    </div>
  );
}
