import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { PermissionGuard } from '../components/ui/PermissionGuard';
import { useAuth } from '../hooks/useAuth';
import { useCollection, useFirestoreAdd, useFirestoreDelete } from '../hooks/useFirestore';
import { useAuditLog } from '../hooks/useAuditLog';
import { uploadFile } from '../firebase/storage';
import { Download, Filter, AlertTriangle, Shield, Plus, CloudUpload, CheckCircle, MoreVertical, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function Financials() {
  const { user } = useAuth();
  const { remove } = useFirestoreDelete('financial_logs');
  const { data: logs, loading } = useCollection('financial_logs', [], 'createdAt');
  const { data: players } = useCollection('players');
  const { data: tournaments } = useCollection('tournaments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartRange, setChartRange] = useState('30');

  const stats = useMemo(() => {
    const totalSalaries = players.filter(p => p.isActive && p.salary).reduce((s, p) => s + Number(p.salary), 0);
    const totalEntryFees = tournaments.reduce((s, t) => s + (Number(t.entryFee?.amount) || 0), 0);
    const income = tournaments.filter(t => t.status === 'completed').reduce((s, t) => s + (Number(t.prizePool) || 0), 0);
    const expense = totalSalaries + totalEntryFees;
    
    // Manual profit calculation as requested: Prize Pool Received - (Entry Fees + Salaries)
    const balance = income - expense; 
    const pending = logs.filter(f => f.flagged || (!f.proofURL && f.type === 'expense' && f.amount > 500)).length;
    
    return { income, expense, balance, pending, totalSalaries, totalEntryFees };
  }, [players, tournaments, logs]);

  const formatCurrency = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  // Chart data — reset to 0
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, i) => ({
      month: m,
      income: 0,
      expense: 0,
    }));
  }, []);

  return (
    <div className="animate-fade-up relative">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400 mb-2 block">Ledger & Audit</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white">FINANCIALS</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-pink-500/30 px-4 py-2 rounded-xl">
          <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#FF2D78]"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-pink-400">Live Anti-Fraud Monitoring</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard delay={0.1} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Total Income</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-black font-display text-white">{formatCurrency(stats.income)}</p>
            <span className="text-[10px] font-bold text-green-400 mb-0.5">+12%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Expenses</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-black font-display text-pink-400">{formatCurrency(stats.expense)}</p>
            <span className="text-[10px] font-bold text-pink-400 mb-0.5">+4%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Peak: Tournament Payouts</p>
        </GlassCard>

        <GlassCard delay={0.2} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Net Profit</p>
          <p className={`text-2xl font-black font-display tracking-tight ${stats.balance >= 0 ? 'text-green-400' : 'text-pink-400'}`}>
            {stats.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(stats.balance))}
          </p>
          <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded mt-2 inline-block">Manual Calculation</span>
        </GlassCard>

        <GlassCard delay={0.25} className="!p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Pending Verifications</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black font-display text-white">{stats.pending}</p>
            <span className="text-xs text-slate-400">Flagged</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Shield size={12} className="text-pink-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-pink-400">Action Required</span>
          </div>
        </GlassCard>
      </div>

      {/* Revenue vs Spending Chart */}
      <GlassCard delay={0.3} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black font-display tracking-widest text-white uppercase">Revenue vs Spending</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Monthly performance audit across all regions</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setChartRange('7')} className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-lg border transition-all ${chartRange === '7' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-slate-500 hover:text-white'}`}>7 Days</button>
            <button onClick={() => setChartRange('30')} className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-lg border transition-all ${chartRange === '30' ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' : 'border-white/5 text-slate-500 hover:text-white'}`}>30 Days</button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00F5FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF2D78" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FF2D78" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'rgba(10,10,26,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                labelStyle={{ color: '#00F5FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
              />
              <Area type="monotone" dataKey="income" stroke="#00F5FF" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#FF2D78" strokeWidth={2} strokeDasharray="6 3" fill="url(#expenseGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Recent Activity Table */}
      <GlassCard delay={0.35} className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black font-display tracking-widest text-white uppercase">Recent Activity</h3>
          <div className="flex items-center gap-4">
            <button onClick={() => toast.success('Filter active: Pending only', {id: 'filter'})} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"><Filter size={14} /> Filter</button>
            <button onClick={() => toast.success('Exporting Ledger...', {id: 'export', icon: '💾'})} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"><Download size={14} /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Transaction Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Verified By</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Proof Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan="7" className="text-center py-8 text-cyan-400">Syncing Ledger...</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-slate-500">No financial records found.</td></tr>}
              {logs.map(log => {
                const date = new Date(log.createdAt);
                const isFlagged = log.flagged || (log.amount > 500 && !log.proofURL && log.type === 'expense');
                const categoryColors = {
                  tournament: 'bg-cyan-400/10 text-cyan-400', sponsor: 'bg-green-400/10 text-green-400',
                  travel: 'bg-yellow-400/10 text-yellow-400', hosting: 'bg-purple-400/10 text-purple-400',
                  streaming: 'bg-pink-400/10 text-pink-400', merchandise: 'bg-green-400/10 text-green-400',
                  bootcamp: 'bg-blue-400/10 text-blue-400', jersey: 'bg-orange-400/10 text-orange-400',
                  prize_pool: 'bg-green-400/10 text-green-400', tournament_entry: 'bg-cyan-400/10 text-cyan-400',
                };

                return (
                  <tr key={log.id} className={`${isFlagged ? 'bg-pink-900/5' : 'hover:bg-white/[0.02]'} transition-colors`}>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-300 block">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[10px] text-slate-600 block">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-white">{log.notes}</p>
                      {isFlagged && <p className="text-[9px] text-pink-400 font-bold uppercase tracking-widest mt-0.5">Flagged: {log.flagReason || 'Unverified'}</p>}
                      {log.linkedTournamentId && <p className="text-[10px] text-slate-500 mt-0.5">Internal Transfer • ID: {log.linkedTournamentId?.substring(0, 8)}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${categoryColors[log.category] || 'bg-white/5 text-slate-400'}`}>
                        {log.category?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-black font-display ${log.type === 'income' ? 'text-cyan-400' : 'text-white'}`}>
                        ₹{log.amount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">{(log.verifiedBy || 'S')[0]}</span>
                        </div>
                        <span className="text-xs text-slate-300">{log.verifiedBy || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {isFlagged ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-500 text-[9px] font-black uppercase tracking-[0.2em] rounded max-w-max">
                          <AlertTriangle size={10} /> MISSING
                        </div>
                      ) : log.proofURL ? (
                        <a href={log.proofURL} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><rect x="1" y="1" width="12" height="12" rx="2"/><path d="M1 9l3-3 2 2 4-4 3 3"/></svg>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">System</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {user?.role === 'owner' ? (
                        <button 
                          onClick={() => {
                            if(window.confirm('WARNING: Permanently delete this transaction record?')) {
                              remove(log.id);
                              toast.success('Transaction Erased');
                            }
                          }}
                          title="Delete Transaction"
                          className="p-1.5 bg-pink-500/10 border border-pink-500/30 rounded hover:bg-pink-500/20 transition-colors inline-block"
                        >
                          <Trash2 size={14} className="text-pink-500" />
                        </button>
                      ) : isFlagged ? (
                        <button className="px-2 py-1 bg-pink-500/20 border border-pink-500/40 text-[9px] font-black uppercase tracking-widest text-pink-400 rounded hover:bg-pink-500/30 transition-colors">Notify</button>
                      ) : (
                        <MoreVertical size={16} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* FAB */}
      <PermissionGuard permission="add_financial_entry">
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:scale-110 active:scale-95 transition-all z-50"
        >
          <Plus size={24} className="text-white" />
        </button>
      </PermissionGuard>

      {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddTransactionModal({ onClose }) {
  const { user } = useAuth();
  const { add } = useFirestoreAdd('financial_logs');
  const { log } = useAuditLog();
  const [form, setForm] = useState({ type: 'expense', category: 'tournament', amount: '', notes: '', proofURL: '', proofPreview: null });

  const handleProofSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, proofPreview: URL.createObjectURL(file) }));
    toast.loading('Uploading...', { id: 'upload' });
    try {
      const url = await uploadFile(file, `proofs/${Date.now()}`);
      setForm(f => ({ ...f, proofURL: url }));
      toast.success('Proof uploaded!', { id: 'upload' });
    } catch {
      toast.error('Upload failed', { id: 'upload' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.notes) return toast.error('Amount & details required');
    const isFraud = form.type === 'expense' && Number(form.amount) > 500 && !form.proofURL;

    await add({
      ...form,
      amount: Number(form.amount),
      uploadedBy: user?.uid,
      uploadedByName: user?.displayName,
      verifiedBy: isFraud ? null : 'System',
      flagged: isFraud,
      flagReason: isFraud ? 'EXPENSE > ₹500 WITHOUT PROOF' : null,
      version: 1,
    });
    await log({ action: 'financial_entry', collection: 'financial_logs', docId: 'new', data: { ...form } });
    toast.success('Transaction logged!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <GlassCard elevated className="w-full max-w-md relative z-10 p-8 border border-white/10" delay={0}>
        <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase mb-6">NEW TRANSACTION</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                <option value="tournament">Tournament</option>
                <option value="sponsor">Sponsor</option>
                <option value="travel">Travel</option>
                <option value="streaming">Streaming</option>
                <option value="merchandise">Merchandise</option>
                <option value="bootcamp">Bootcamp</option>
                <option value="jersey">Jersey</option>
                <option value="hosting">Hosting</option>
                <option value="prize_pool">Prize Pool</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="10000" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Details</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3 text-sm" placeholder="Tournament entry fee for BGIS..." />
          </div>
          <div className={`p-4 rounded-xl border-2 border-dashed ${form.proofURL ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-white/5'} flex flex-col items-center gap-2 relative overflow-hidden`}>
            {form.proofURL ? (
              <>
                <CheckCircle size={24} className="text-green-500" />
                <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Proof Uploaded</p>
              </>
            ) : (
              <>
                <CloudUpload size={24} className="text-slate-500" />
                <p className="text-[10px] text-slate-400">Upload payment / prize pool screenshot</p>
                <input type="file" accept="image/*" onChange={handleProofSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
              </>
            )}
          </div>
          {form.type === 'expense' && Number(form.amount) > 500 && !form.proofURL && (
            <div className="flex items-center gap-2 p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl">
              <AlertTriangle size={16} className="text-pink-500" />
              <p className="text-[10px] font-bold text-pink-400 tracking-widest uppercase">Anti-Fraud: Expenses {'>'} ₹500 require proof</p>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <NeonButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</NeonButton>
            <NeonButton type="submit" className="flex-1">Log Transaction</NeonButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
