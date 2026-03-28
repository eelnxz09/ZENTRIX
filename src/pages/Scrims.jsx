import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { PermissionGuard } from '../components/ui/PermissionGuard';
import { useCollection, useFirestoreAdd, useFirestoreUpdate, useFirestoreDelete } from '../hooks/useFirestore';
import { Activity, Plus, Play, Square, Edit, Trash2, Camera, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GAMES } from '../utils/games';

export default function Scrims() {
  const { data: scrims, loading } = useCollection('scrims');
  const [showModal, setShowModal] = useState(false);
  const [editScrim, setEditScrim] = useState(null);
  const [paymentScrim, setPaymentScrim] = useState(null);
  const [endScrim, setEndScrim] = useState(null);
  
  const { update } = useFirestoreUpdate('scrims');
  const { remove } = useFirestoreDelete('scrims');

  const liveScrims = scrims.filter(s => s.status === 'live');
  const pastScrims = scrims.filter(s => s.status !== 'live');

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this scrim?")) {
      await remove(id);
      toast.success("Scrim deleted.");
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-pink-500 uppercase mb-2 block">Live Operations</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">SCRIMS</h1>
        </div>
        
        <PermissionGuard permission="manage_scrims">
          <NeonButton onClick={() => setShowModal(true)}>
            <Plus size={18} /> Schedule Scrim
          </NeonButton>
        </PermissionGuard>
      </div>

      {liveScrims.map(live => (
         <LiveScrimPanel key={live.id} scrim={live} onEnd={() => {
             setEndScrim(live);
         }} />
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {loading ? (
             <div className="col-span-full flex justify-center py-12 text-cyan-400">
             <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
             </div>
        ) : pastScrims.map(s => (
           <GlassCard key={s.id} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 flex gap-2">
                 <PermissionGuard permission="manage_scrims">
                   <button onClick={() => setEditScrim(s)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                     <Edit size={16} />
                   </button>
                   <button onClick={() => handleDelete(s.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                     <Trash2 size={16} />
                   </button>
                 </PermissionGuard>
                 <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/30">
                     {s.status}
                 </span>
              </div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 mb-1">{s.game}</p>
              <h3 className="text-xl font-bold font-display text-white pr-16 break-words">vs {s.opponent}</h3>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {s.status === 'scheduled' && (
                    <PermissionGuard permission="manage_scrims">
                        <NeonButton 
                          variant={(s.paymentProofUrl || s.isFree) ? "secondary" : "danger"} 
                          className="flex-1 justify-center py-2 border-pink-500/30" 
                          disabled={!s.paymentProofUrl && !s.isFree}
                          onClick={async () => {
                            await update(s.id, { status: 'live', startTime: Date.now() });
                            toast.success('Scrim matches initialized! 🎮');
                        }}>
                           {(s.paymentProofUrl || s.isFree) ? <><Play size={14} /> Start Scrim</> : <><Camera size={14} /> Upload Fee First</>}
                        </NeonButton>
                    </PermissionGuard>
                )}
                
                 <PermissionGuard permission="manage_scrims">
                   <button 
                     onClick={() => !s.isFree && setPaymentScrim(s)}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                       s.isFree ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 cursor-default' :
                       s.paymentProofUrl ? 'border-green-500/50 bg-green-500/10 text-green-400' : 
                       'border-pink-500/50 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'
                     }`}
                   >
                     {s.isFree ? <><Activity size={12} /> Free Match</> : s.paymentProofUrl ? <CheckmarkIcon /> : <Camera size={14} />} 
                     {!s.isFree && (s.paymentProofUrl ? "Paid" : "Verify Payment")}
                   </button>
                </PermissionGuard>
              </div>
           </GlassCard>
        ))}
      </div>

      {showModal && <AddScrimModal onClose={() => setShowModal(false)} />}
      {editScrim && <EditScrimModal scrim={editScrim} onClose={() => setEditScrim(null)} />}
      {paymentScrim && <PaymentVerificationModal scrim={paymentScrim} onClose={() => setPaymentScrim(null)} />}
      {endScrim && <EndScrimModal scrim={endScrim} onClose={() => setEndScrim(null)} />}
    </div>
  );
}

function CheckmarkIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LiveScrimPanel({ scrim, onEnd }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!scrim?.startTime) return;
    const interval = setInterval(() => {
      const start = scrim.startTime;
      const t = Date.now() - start;
      const h = Math.floor(t / 3600000);
      const m = Math.floor((t % 3600000) / 60000);
      const s = Math.floor((t % 60000) / 1000);
      setElapsed(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [scrim]);

  return (
    <GlassCard elevated className="border-pink-500/30 relative overflow-hidden bg-gradient-to-r from-pink-900/10 to-transparent p-0 group">
       <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-pink-500/10 to-transparent pointer-events-none group-hover:from-pink-500/20 transition-all duration-1000"></div>
       <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-pink-500/10 border-2 border-pink-500 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,45,120,0.5)]">
                 <span className="w-6 h-6 bg-pink-500 rounded-full animate-pulse shadow-[0_0_15px_#FF2D78]"></span>
                 <div className="absolute -inset-2 border border-pink-500/30 rounded-full animate-ping"></div>
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500">LIVE SCRIM TICKER</span>
                      <Activity size={14} className="text-pink-500" />
                  </div>
                  <h2 className="text-3xl font-black font-display text-white tracking-tighter uppercase">Zentrix vs {scrim.opponent}</h2>
                  <p className="text-slate-400 text-sm font-medium tracking-wide">Squad | {scrim.game}</p>
              </div>
           </div>

           <div className="flex items-center gap-8">
               <div className="text-center">
                   <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 mb-1">Time Elapsed</p>
                   <p className="text-4xl font-display font-black text-white text-glow-cyan drop-shadow-[0_0_10px_rgba(0,245,255,0.5)] tracking-widest w-40">{elapsed}</p>
               </div>
               <PermissionGuard permission="manage_scrims">
                   <NeonButton variant="danger" onClick={onEnd} className="h-14 px-8">
                       <Square size={20} className="fill-current" /> Terminate Scrim
                   </NeonButton>
               </PermissionGuard>
           </div>
       </div>
    </GlassCard>
  );
}

function AddScrimModal({ onClose }) {
  const [form, setForm] = useState({ opponent: '', game: 'BGMI', isFree: false });
  const { add, loading } = useFirestoreAdd('scrims');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.opponent) return toast.error('Required');
    await add({ ...form, status: 'scheduled' });
    toast.success('Scrim Scheduled!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-sm relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">NEW SCRIM</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Opposing Entity</label>
              <input value={form.opponent} onChange={e=>setForm({...form, opponent: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Ex: Team Soul" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Combat Arena</label>
              <select value={form.game} onChange={e=>setForm({...form, game: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                 {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isFree" 
                checked={form.isFree} 
                onChange={e=>setForm({...form, isFree: e.target.checked})}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-400 accent-cyan-400"
              />
              <label htmlFor="isFree" className="text-xs font-bold text-slate-300 uppercase tracking-widest cursor-pointer">This is a Free Scrim</label>
            </div>
            <div className="flex gap-4 pt-4">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="submit" disabled={loading} className="flex-1">Schedule</NeonButton>
            </div>
         </form>
       </GlassCard>
    </div>
  );
}

function EditScrimModal({ scrim, onClose }) {
  const [form, setForm] = useState({ opponent: scrim.opponent, game: scrim.game, isFree: scrim.isFree || false });
  const { update, loading } = useFirestoreUpdate('scrims');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.opponent) return toast.error('Required');
    await update(scrim.id, form);
    toast.success('Scrim Updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-sm relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">EDIT SCRIM</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Opposing Entity</label>
              <input value={form.opponent} onChange={e=>setForm({...form, opponent: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Ex: Team Soul" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Combat Arena</label>
              <select value={form.game} onChange={e=>setForm({...form, game: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                 {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="editIsFree" 
                checked={form.isFree} 
                onChange={e=>setForm({...form, isFree: e.target.checked})}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-400 accent-cyan-400"
              />
              <label htmlFor="editIsFree" className="text-xs font-bold text-slate-300 uppercase tracking-widest cursor-pointer">This is a Free Scrim</label>
            </div>
            <div className="flex gap-4 pt-4">
               <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
               <NeonButton type="submit" disabled={loading} className="flex-1">Save</NeonButton>
            </div>
         </form>
       </GlassCard>
    </div>
  );
}

function PaymentVerificationModal({ scrim, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { update } = useFirestoreUpdate('scrims');

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
          // 40% quality JPEG is enough for verification, keeps it ~30KB
          resolve(canvas.toDataURL('image/jpeg', 0.4)); 
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a screenshot.");
    setUploading(true);
    try {
      const base64Url = await compressToBase64(file);
      await update(scrim.id, { paymentProofUrl: base64Url });
      toast.success("Payment verified instantly!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify snapshot.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">VERIFY PAYMENT</h2>
         {scrim.paymentProofUrl ? (
           <div className="text-center space-y-4">
             <div className="w-full h-48 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
                <img src={scrim.paymentProofUrl} alt="Payment Proof" className="max-w-full max-h-full object-contain" />
             </div>
             <p className="text-green-400 font-bold text-sm tracking-wide flex items-center justify-center gap-2">
               <CheckmarkIcon /> Payment Verified
             </p>
             <NeonButton variant="secondary" onClick={onClose} className="w-full">Close</NeonButton>
           </div>
         ) : (
           <div className="space-y-6 text-center">
             <p className="text-sm text-slate-300">Upload screenshot verification for the <strong>Entry Fee (Payment Given)</strong> against <strong>{scrim.opponent}</strong>.</p>
             <label className="w-full h-32 border-2 border-dashed border-cyan-500/30 rounded-xl flex flex-col items-center justify-center text-cyan-400 hover:bg-cyan-500/5 cursor-pointer transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                <UploadCloud size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">{file ? file.name : 'Select Screenshot'}</span>
             </label>
             <div className="flex gap-4 pt-4">
                <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
                <NeonButton type="button" disabled={!file || uploading} onClick={handleUpload} className="flex-1">
                  {uploading ? 'Uploading...' : 'Verify'}
                </NeonButton>
             </div>
           </div>
         )}
       </GlassCard>
     </div>
  );
}

function EndScrimModal({ scrim, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { update } = useFirestoreUpdate('scrims');

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

  const handleEnd = async () => {
    if (!file && !scrim.isFree) return toast.error("Winnings screenshot is compulsory to end the scrim.");
    setUploading(true);
    try {
      const base64Url = file ? await compressToBase64(file) : null;
      await update(scrim.id, { 
         winningsProofUrl: base64Url, 
         status: 'completed', 
         endTime: Date.now() 
      });
      toast.success("Winnings verified and Scrim concluded!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to conclude scrim.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
       <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
         <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">CONCLUDE SCRIM</h2>
         <div className="space-y-6 text-center">
           <p className="text-sm text-slate-300">Upload screenshot verification for the <strong>WINNINGS (Payment Received)</strong> against <strong>{scrim.opponent}</strong>.</p>
           <label className="w-full h-32 border-2 border-dashed border-green-500/30 rounded-xl flex flex-col items-center justify-center text-green-400 hover:bg-green-500/5 cursor-pointer transition-colors">
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
              <UploadCloud size={32} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">{file ? file.name : 'Select Winnings Screenshot'}</span>
           </label>
           <div className="flex gap-4 pt-4">
              <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
              <NeonButton type="button" disabled={!file || uploading} onClick={handleEnd} variant="danger" className="flex-1">
                {uploading ? 'Verifying...' : 'Conclude & Verify'}
              </NeonButton>
           </div>
         </div>
       </GlassCard>
    </div>
  );
}
