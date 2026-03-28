import React, { useState } from 'react';
import { NeonButton } from '../ui/NeonButton';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { getRoleLabel } from '../../utils/permissions';
import toast from 'react-hot-toast';

export const CredentialDisplay = ({ credentials, onDone }) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!credentials) return null;

  const credText = `Zentrix Esports — Login Credentials\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nName: ${credentials.displayName}\nRole: ${getRoleLabel(credentials.role)}\nEmail: ${credentials.email}\nPassword: ${credentials.password}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nLogin at: zentrixesports.com`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(credText);
      setCopied(true);
      toast.success('Credentials copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = credText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Credentials copied');
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-pink-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-pink-400 font-bold tracking-widest leading-relaxed uppercase">
          These credentials are shown ONLY ONCE. Copy them now and share with the user securely.
        </p>
      </div>

      {/* Credential Card */}
      <div className="glass-card rounded-xl p-6 space-y-4 border border-cyan-400/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Name</p>
            <p className="text-sm font-bold text-white">{credentials.displayName}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Role</p>
            <p className="text-sm font-bold text-cyan-400">{getRoleLabel(credentials.role)}</p>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Email</p>
          <p className="text-sm font-mono font-bold text-white bg-white/5 px-3 py-2 rounded-lg">{credentials.email}</p>
        </div>

        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Temporary Password</p>
          <p className="text-lg font-mono font-black text-cyan-400 bg-white/5 px-3 py-2 rounded-lg tracking-wider">{credentials.password}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <NeonButton variant="primary" onClick={handleCopy} className="w-full">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Credentials'}
        </NeonButton>

        <label className="flex items-center gap-3 cursor-pointer p-3 glass-card rounded-xl">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 accent-cyan-400"
          />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            I have saved these credentials
          </span>
        </label>

        <NeonButton variant="secondary" onClick={onDone} disabled={!confirmed} className="w-full">
          Done
        </NeonButton>
      </div>
    </div>
  );
};
