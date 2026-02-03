"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, Wallet, FileText, Loader2, Calendar } from 'lucide-react';

export default function DashboardExpert() {
  const [profile, setProfile] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enCours: 0, terminees: 0, gains: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchExpertData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      // 1. Profil de l'expert
      const { data: prof } = await supabase.from('profils').select('*').eq('id', user.id).single();
      setProfile(prof);

      // 2. Récupérer SES phases uniquement
      const { data: sesPhases } = await supabase
        .from('phases')
        .select(`*, activites(nom, projets(nom))`)
        .eq('expert_id', user.id);

      if (sesPhases) {
        setPhases(sesPhases);
        const enCours = sesPhases.filter(p => p.statut_avancement !== 'termine').length;
        const done = sesPhases.filter(p => p.statut_avancement === 'termine').length;
        const gains = sesPhases.reduce((acc, p) => acc + (p.montant_expert || 0), 0);
        setStats({ enCours, terminees: done, gains });
      }
      setLoading(false);
    };

    fetchExpertData();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white font-black text-[#00AEEF] animate-pulse">CHARGEMENT EXPERT...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={profile} />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">
            Espace <span className="text-[#7DB95C]">Production</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
            Expert : {profile?.nom} — {profile?.titre || 'Consultant NSIK'}
          </p>
        </header>

        {/* STATS EXPERT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-8 border-orange-400">
            <Clock className="text-orange-400 mb-4" size={28} />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Phases à traiter</p>
            <p className="text-5xl font-black text-gray-900 mt-1">{stats.enCours}</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-8 border-[#7DB95C]">
            <CheckCircle2 className="text-[#7DB95C] mb-4" size={28} />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Phases Validées</p>
            <p className="text-5xl font-black text-gray-900 mt-1">{stats.terminees}</p>
          </div>

          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border-l-8 border-[#00AEEF]">
            <Wallet className="text-[#00AEEF] mb-4" size={28} />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Honoraires Totaux</p>
            <p className="text-3xl font-black text-white mt-1">{stats.gains.toLocaleString()} <span className="text-xs">FCFA</span></p>
          </div>
        </div>

        {/* LISTE DES MISSIONS */}
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b-2 border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
              <FileText className="text-[#00AEEF]" /> Mes Missions en cours
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="p-6">Projet / Phase</th>
                  <th className="p-6">Échéance</th>
                  <th className="p-6">Honoraires</th>
                  <th className="p-6">Statut</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((phase) => (
                  <tr key={phase.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <p className="text-xs font-black text-gray-900 uppercase">{phase.activites?.projets?.nom}</p>
                      <p className="text-[10px] font-bold text-[#00AEEF] uppercase">{phase.nom}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-600">
                        <Calendar size={14} />
                        {new Date(phase.delai).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6 font-black text-gray-900 text-sm">
                      {phase.montant_expert?.toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </td>
                    <td className="p-6">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        phase.statut_avancement === 'termine' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {phase.statut_avancement.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="bg-gray-900 text-white text-[9px] font-black px-4 py-2 rounded-xl hover:bg-[#00AEEF] transition-all uppercase tracking-widest">
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}