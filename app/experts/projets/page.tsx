"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { Play, Calendar, ArrowRight, Loader2, Info, Landmark, Filter, Wallet } from 'lucide-react';

export default function MesMissionsExpert() {
  const [phases, setPhases] = useState<any[]>([]);
  const [filteredPhases, setFilteredPhases] = useState<any[]>([]);
  const [filter, setFilter] = useState('tous');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchExpertData();
  }, []);

  useEffect(() => {
    if (filter === 'tous') {
      setFilteredPhases(phases);
    } else {
      setFilteredPhases(phases.filter(p => p.statut_avancement === filter));
    }
  }, [filter, phases]);

  const fetchExpertData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profils').select('*').eq('id', user.id).single();
      setProfile(prof);

      // REQUÊTE CORRIGÉE SELON TON SCHÉMA
      const { data, error } = await supabase
        .from('phases')
        .select(`
          *,
          activites (
            nom,
            projets (
              nom,
              localisation
            )
          )
        `)
        .eq('expert_id', user.id) // Utilise expert_id de ta table phases
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur de récupération:", error.message);
        return;
      }

      setPhases(data || []);
      setFilteredPhases(data || []);
    } catch (err) {
      console.error("Erreur catch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des gains (Missions terminées)
  const totalGains = phases
    .filter(p => p.statut_avancement === 'termine')
    .reduce((sum, p) => sum + (Number(p.montant_expert) || 0), 0);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] bg-white italic uppercase tracking-widest">
      <Loader2 className="animate-spin mr-2" /> Chargement du terrain...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={profile} />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-6xl font-black text-gray-900 uppercase italic tracking-tighter">
            Mes <span className="text-[#00AEEF]">Missions</span>
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
             Expert : {profile?.nom} • {profile?.titre || 'Cameroun'}
          </p>
        </header>

        {/* SECTION PORTEFEUILLE (Gains) */}
        <div className="bg-gray-900 p-8 rounded-[3rem] mb-10 text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
              <Wallet size={12} /> Gains cumulés (Terminés)
            </p>
            <h2 className="text-4xl font-black text-[#7DB95C] italic mt-1">
              {totalGains.toLocaleString()} <span className="text-xs uppercase not-italic text-white">FCFA</span>
            </h2>
          </div>
          <div className="text-right relative z-10">
            <p className="text-[10px] font-black uppercase text-gray-500">Missions validées</p>
            <p className="text-3xl font-black text-[#00AEEF]">
              {phases.filter(p => p.statut_avancement === 'termine').length}
            </p>
          </div>
          {/* Décoration en arrière-plan */}
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <Wallet size={150} />
          </div>
        </div>

        {/* FILTRAGE RAPIDE */}
        <div className="flex flex-wrap gap-3 mb-10">
          {['tous', 'en_attente', 'en_cours', 'termine'].map((id) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === id 
                ? 'bg-[#00AEEF] text-white shadow-lg' 
                : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-gray-200'
              }`}
            >
              {id.replace('_', ' ')}
            </button>
          ))}
        </div>

        {filteredPhases.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
            <Info className="mx-auto text-gray-300 mb-4" size={40} />
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Aucune mission trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhases.map((phase) => (
              <div key={phase.id} className="bg-white p-8 rounded-[3rem] shadow-sm border-2 border-transparent hover:border-[#00AEEF] transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    phase.statut_avancement === 'en_attente' ? 'bg-orange-100 text-orange-600' :
                    phase.statut_avancement === 'en_cours' ? 'bg-blue-100 text-[#00AEEF]' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {phase.statut_avancement?.replace('_', ' ')}
                  </div>
                  <Landmark size={20} className="text-gray-100" />
                </div>

                <p className="text-[#7DB95C] font-black text-[9px] uppercase tracking-widest mb-1">
                  {phase.activites?.projets?.nom}
                </p>
                <h3 className="text-2xl font-black text-gray-900 uppercase italic leading-none mb-6">
                  {phase.nom}
                </h3>
                
                <div className="space-y-2 mb-10">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <Calendar size={14} />
                        <span>Délai : {phase.delai ? new Date(phase.delai).toLocaleDateString('fr-FR') : 'NC'}</span>
                    </div>
                    <div className="text-lg font-black text-gray-900 italic">
                        {Number(phase.montant_expert)?.toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </div>
                </div>
                
                <button 
                  onClick={() => router.push(`/experts/phases/${phase.id}`)}
                  className="w-full py-5 bg-gray-50 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center justify-center gap-3 group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm"
                >
                  Ouvrir la phase <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}