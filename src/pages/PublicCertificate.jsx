import React from 'react';
import { useParams } from 'react-router-dom';
import { useDocument } from '../hooks/useFirestore';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatDate } from '../utils/formatters';
import { Award, ExternalLink, CheckCircle } from 'lucide-react';

export default function PublicCertificate() {
  const { certId } = useParams();
  const { data: cert, loading } = useDocument('certificates', certId);

  if (loading) return <FullPageSpinner text="Verifying certificate..." />;

  if (!cert) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center font-body">
        <div className="text-center">
          <Award size={64} className="text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-black font-display text-white mb-2">Certificate Not Found</h1>
          <p className="text-sm text-slate-400">This certificate ID does not exist or has been revoked.</p>
          <p className="text-xs text-slate-600 font-mono mt-4">ID: {certId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-2xl">
        {/* Verification Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle size={18} className="text-green-400" />
          <span className="text-[10px] font-black tracking-widest uppercase text-green-400">Verified Certificate</span>
        </div>

        {/* Certificate */}
        <div className="glass-card rounded-2xl p-8 border border-cyan-400/20 text-center">
          <h1 className="text-3xl font-black font-display text-cyan-400 tracking-widest mb-2">ZENTRIX ESPORTS</h1>
          <div className="w-20 h-0.5 bg-cyan-400/30 mx-auto mb-6" />

          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">This Certifies That</p>
          <h2 className="text-4xl font-black font-display text-white mb-2">{cert.playerName}</h2>

          <p className="text-sm text-slate-400 mb-6">{cert.description || `Has been awarded for participation in ${cert.tournamentName}`}</p>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Tournament</p>
              <p className="text-sm font-bold text-white">{cert.tournamentName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Game</p>
              <p className="text-sm font-bold text-white">{cert.game}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Date</p>
              <p className="text-sm font-bold text-white">{formatDate(cert.issuedAt || cert.createdAt)}</p>
            </div>
          </div>

          <p className="text-[10px] text-slate-600 font-mono mt-6">Certificate ID: {cert.id}</p>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4">
          Issued by Zentrix Esports India • <a href="/" className="text-cyan-400 hover:underline">zentrixesports.com</a>
        </p>
      </div>
    </div>
  );
}
