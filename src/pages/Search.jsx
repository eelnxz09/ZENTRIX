import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { useCollection } from '../hooks/useFirestore';
import { Search as SearchIcon, Users, Trophy, Flag } from 'lucide-react';

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  
  const { data: players, loading: l1 } = useCollection('players');
  const { data: teams, loading: l2 } = useCollection('teams');
  const { data: tourneys, loading: l3 } = useCollection('tournaments');

  const loading = l1 || l2 || l3;

  const results = useMemo(() => {
    if (!query) return { players: [], teams: [], tourneys: [] };
    const q = query.toLowerCase();
    
    return {
       players: players.filter(p => !p.terminated && (p.ingameName?.toLowerCase().includes(q) || p.uid?.toLowerCase() === q)),
       teams: teams.filter(t => t.name?.toLowerCase().includes(q) || t.game?.toLowerCase().includes(q)),
       tourneys: tourneys.filter(t => t.name?.toLowerCase().includes(q) || t.organizer?.toLowerCase().includes(q))
    };
  }, [players, teams, tourneys, query]);

  return (
    <div className="animate-fade-up">
      <div className="mb-8 border-b border-white/10 pb-8">
         <h1 className="text-3xl md:text-4xl font-black font-display tracking-tighter text-white flex items-center gap-4">
            <SearchIcon className="text-cyan-400" size={32} /> SEARCH RESULTS
         </h1>
         <p className="text-slate-400 mt-2 text-sm font-bold tracking-widest uppercase">Query: <span className="text-cyan-400">"{query}"</span></p>
      </div>

      {loading ? (
         <div className="flex justify-center py-12 text-cyan-400">
             <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
         </div>
      ) : !query || (results.players.length === 0 && results.teams.length === 0 && results.tourneys.length === 0) ? (
         <div className="text-center py-20 text-slate-500">
             <SearchIcon size={64} className="mx-auto mb-4 opacity-50" />
             <p className="font-bold tracking-widest uppercase text-sm">No databases matched your exact query.</p>
         </div>
      ) : (
         <div className="space-y-12">
            {results.teams.length > 0 && (
               <div>
                  <h2 className="text-[10px] font-bold tracking-widest uppercase text-pink-500 mb-4 flex items-center gap-2">
                     <Flag size={14} /> Registered Teams ({results.teams.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {results.teams.map(t => (
                        <GlassCard key={t.id} className="p-4 border-l-2 border-l-pink-500">
                           <h3 className="font-display font-black text-white text-xl">{t.name}</h3>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.game}</p>
                        </GlassCard>
                     ))}
                  </div>
               </div>
            )}

            {results.players.length > 0 && (
               <div>
                  <h2 className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 mb-4 flex items-center gap-2">
                     <Users size={14} /> Active Personnel ({results.players.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {results.players.map(p => (
                        <GlassCard key={p.id} className="p-4 border-l-2 border-l-cyan-400">
                           <h3 className="font-display font-black text-white text-xl">{p.ingameName}</h3>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">UID: {p.uid}</p>
                        </GlassCard>
                     ))}
                  </div>
               </div>
            )}

            {results.tourneys.length > 0 && (
               <div>
                  <h2 className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 mb-4 flex items-center gap-2">
                     <Trophy size={14} /> Competitive Events ({results.tourneys.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {results.tourneys.map(t => (
                        <GlassCard key={t.id} className="p-4 border-l-2 border-l-yellow-400">
                           <h3 className="font-display font-black text-white text-xl">{t.name}</h3>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.organizer} • {t.game}</p>
                        </GlassCard>
                     ))}
                  </div>
               </div>
            )}
         </div>
      )}
    </div>
  );
}
