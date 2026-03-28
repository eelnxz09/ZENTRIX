import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useCollection } from '../hooks/useFirestore';
import { Badge } from '../components/ui/Badge';
import { formatDateTime, formatAction, timeAgo } from '../utils/formatters';
import { ScrollText, RefreshCw } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';

export default function AuditLogs() {
  const { data: auditLogs, loading } = useCollection('audit_logs', [], 'timestamp');

  const actionColors = {
    user_created: 'success',
    user_login: 'primary',
    user_logout: 'default',
    role_created: 'purple',
    role_updated: 'purple',
    role_assigned: 'purple',
    role_deleted: 'danger',
    financial_entry: 'success',
    financial_amended: 'warning',
    tournament_added: 'success',
    player_added: 'success',
    player_updated: 'primary',
    team_created: 'success',
    scrim_created: 'primary',
    data_sync: 'warning',
    update_roster: 'purple',
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Audit Logs" subtitle="System Accountability">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] font-bold tracking-widest uppercase">Last Sync: Just Now</span>
          <RefreshCw size={14} className="cursor-pointer hover:text-cyan-400 transition-colors" />
        </div>
      </PageHeader>

      <GlassCard delay={0.1} className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <ScrollText size={18} className="text-cyan-400" />
          <h3 className="text-sm font-black font-display tracking-widest text-white uppercase">Immutable System Log</h3>
          <Badge variant="primary" dot pulse>Live</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Collection</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Time Ago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Loading audit logs...</td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No audit logs yet. Actions will appear here automatically.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-300 whitespace-nowrap font-mono">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-white">{log.performedByName}</p>
                        <p className="text-[10px] text-slate-500">{log.performedByEmail || log.performedBy}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={actionColors[log.action] || 'default'}>
                        {formatAction(log.action)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{log.collection}</td>
                    <td className="px-6 py-4 text-xs text-slate-300 max-w-[300px] truncate">
                      {log.notes || log.entity || JSON.stringify(log.data).slice(0, 80)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{timeAgo(log.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
