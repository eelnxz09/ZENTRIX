import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { exportCertificateAsPDF, TEMPLATES } from '../utils/certificateGenerator';
import { Award, Download, FilePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { GAMES } from '../utils/games';

export default function Certificates() {
  const [form, setForm] = useState({
     playerName: '',
     tournamentName: '',
     placement: '1',
     game: 'BGMI',
     template: 'winner',
     date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if(!form.playerName || !form.tournamentName) return toast.error('Fill required fields');
    setLoading(true);
    toast.loading('Synthesizing Award Graphics...', { id: 'cert' });
    try {
        const certId = 'ZX-CERT-' + Date.now().toString().slice(-6);
        // Pass template key + form data so it re-renders with the real base64 logo
        await exportCertificateAsPDF(form.template, form, certId);
        toast.success(`Certificate ${certId} Exported!`, { id: 'cert' });
    } catch(err) {
        toast.error('Failed to generate certificate', { id: 'cert' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase mb-2 block">Award System V2.0</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">CERTIFICATE GENERATOR</h1>
        </div>
        <NeonButton variant="secondary" onClick={() => toast('Batch upload via CSV coming in V2.1', { icon: '🚧'})}>
            <FilePlus size={18} /> Export Batch
        </NeonButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
             <GlassCard className="border-t-4 border-t-purple-500">
                <h2 className="text-xl font-bold font-display text-white tracking-widest uppercase mb-6 text-glow-purple">Manual Creator</h2>
                <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Recipient Name</label>
                      <input value={form.playerName} onChange={e=>setForm({...form, playerName: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm font-bold" placeholder="Ishaan 'Shadow' Verma" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tournament Name</label>
                      <input value={form.tournamentName} onChange={e=>setForm({...form, tournamentName: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Zentrix Pro League" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Game Context</label>
                          <select value={form.game} onChange={e=>setForm({...form, game: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm text-cyan-400 font-bold">
                             {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Award Template</label>
                          <select value={form.template} onChange={e=>setForm({...form, template: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm text-white font-bold">
                            <option value="winner">Tier 1: Championship Winner</option>
                            <option value="mvp">Tier 1: M.V.P</option>
                            <option value="cyberpunk">Tier 1: Cyberpunk Elite</option>
                            <option value="tactician">Tier 2: Tactician Merit</option>
                            <option value="sharpshooter">Tier 2: Sharpshooter Award</option>
                            <option value="igl">Tier 2: IGL Excellence</option>
                            <option value="rookie">Tier 2: Rookie of the Year</option>
                            <option value="clutch">Tier 2: Clutch Master</option>
                            <option value="honneur">Tier 3: Esports Honor Roll</option>
                            <option value="participation">Tier 3: Basic Participation</option>
                          </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rank / Position</label>
                          <input type="number" value={form.placement} onChange={e=>setForm({...form, placement: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm text-purple-400 font-bold" placeholder="1" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date Issued</label>
                          <input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} className="w-full input-glass rounded-xl px-4 py-3 text-sm text-slate-300" />
                        </div>
                    </div>
                    <div className="pt-6">
                        <NeonButton onClick={handleGenerate} disabled={loading || !form.playerName} variant="danger" className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-[0_0_20px_rgba(191,95,255,0.4)]">
                            {loading ? 'Synthesizing...' : 'GENERATE FINAL AWARD'}
                        </NeonButton>
                    </div>
                </div>
             </GlassCard>
          </div>

          <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-white/10 bg-[#050510] relative flex items-center justify-center min-h-[500px]">
             {/* Live Preview Container that precisely scales the 1920x1080 template */}
             <div 
                className="transform-gpu pointer-events-none"
                style={{
                  width: '1920px', 
                  height: '1080px', 
                  transform: 'scale(0.35)', 
                  transformOrigin: 'center center'
                }}>
                 <div id="certificate-live-preview" dangerouslySetInnerHTML={{__html: TEMPLATES[form.template] ? TEMPLATES[form.template](form) : ''}} />
             </div>
          </div>
      </div>
    </div>
  );
}
