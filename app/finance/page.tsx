"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Loader2,
  PieChart
} from 'lucide-react';

export default function FinanceNSIK() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReel: 0,
    totalExperts: 0,
    marge: 0,
    paiementsEnAttente: 0
  });
  const [recentPhases, setRecentPhases] = useState<any[]>([]);

  const fetchFinanceData = async () => {
    setLoading(true);
    
    // 1. Récupérer toutes les phases pour calculer les totaux
    const { data: phases, error } = await supabase
      .from('phases')
      .select(`
        id, 
        nom, 
        montant_reel, 
        montant_expert, 
        statut_paiement,
        activites (nom, projets (nom))
      `);

    if (phases) {
      const totalReel = phases.reduce((acc, p) => acc + (p.montant_reel || 0), 0);
      const totalExperts = phases.reduce((acc, p) => acc + (p.montant_expert || 0), 0);
      const enAttente = phases.filter(p => p.statut_paiement === 'prepaye').length;

      setStats({
        totalReel,
        totalExperts,
        marge: totalReel - totalExperts,
        paiementsEnAttente: enAttente
      });
      setRecentPhases(phases.slice(0, 8)); // On affiche les 8 dernières transactions
    }
    setLoading(false);
  };

  useEffect(() => { fetchFinanceData(); }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-[#00AEEF] bg-white text-2xl">CHARGEMENT DES FINANCES...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <h1 className="text-5xl font-black uppercase text-gray-900 tracking-tighter mb-10 italic">
          Tableau de <span className="text-[#00AEEF]">Bord Financier</span>
        </h1>

        {/* CARTES DE STATISTIQUES GÉANTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          
          {/* TOTAL ENCAISSÉ (CLIENTS) */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="p-4 bg-blue-50 rounded-2xl text-[#00AEEF]">
                <TrendingUp size={28} />
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Global</span>
            </div>
            <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest">CA Brut (Clients)</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalReel.toLocaleString()} <span className="text-sm">FCFA</span></h2>
          </div>

          {/* MARGE NSIK (BÉNÉFICE) */}
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-[#7DB95C] rounded-2xl text-white">
                <DollarSign size={28} />
              </div>
              <ArrowUpRight className="text-[#7DB95C]" size={32} />
            </div>
            <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest">Marge Net NSIK</p>
            <h2 className="text-3xl font-black text-white mt-1">{stats.marge.toLocaleString()} <span className="text-sm">FCFA</span></h2>
          </div>

          {/* CHARGES EXPERTS */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
                <Users size={28} />
              </div>
              <ArrowDownRight className="text-red-400" size={32} />
            </div>
            <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest">Total Experts (Charges)</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalExperts.toLocaleString()} <span className="text-sm">FCFA</span></h2>
          </div>

          {/* PAIEMENTS EN ATTENTE */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-red-50 rounded-2xl text-red-500">
                <Wallet size={28} />
              </div>
              <span className="bg-red-100 text-red-600 text-[10px] px-3 py-1 rounded-full font-black">ACTION REQUISE</span>
            </div>
            <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest">Factures Impayées</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.paiementsEnAttente} <span className="text-sm">PHASES</span></h2>
          </div>
        </div>

        {/* TABLEAU DES DERNIÈRES TRANSACTIONS PAR PHASE */}
        <div className="bg-white rounded-[3rem] border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b-2 border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase text-gray-900 tracking-tighter flex items-center gap-3">
              <PieChart className="text-[#00AEEF]" /> Analyse par Phase
            </h3>
            <button className="text-[10px] font-black text-[#00AEEF] uppercase border-2 border-[#00AEEF] px-6 py-2 rounded-full hover:bg-[#00AEEF] hover:text-white transition-all">
              Exporter PDF
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 uppercase text-[10px] font-black text-gray-400 tracking-[0.2em]">
                  <th className="p-6">Projet / Phase</th>
                  <th className="p-6">Montant Client</th>
                  <th className="p-6">Part Expert</th>
                  <th className="p-6">Marge NSIK</th>
                  <th className="p-6 text-center">Statut Paiement</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {recentPhases.map((phase) => (
                  <tr key={phase.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6">
                      <p className="text-xs font-black text-gray-900 uppercase">{phase.activites?.projets?.nom}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{phase.nom}</p>
                    </td>
                    <td className="p-6 font-black text-gray-900 text-sm">
                      {phase.montant_reel?.toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </td>
                    <td className="p-6 font-black text-orange-600 text-sm italic">
                      - {phase.montant_expert?.toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className="bg-[#7DB95C]/10 text-[#7DB95C] px-4 py-2 rounded-xl font-black text-sm">
                        + {(phase.montant_reel - phase.montant_expert).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${
                        phase.statut_paiement === 'paye' 
                        ? 'bg-[#7DB95C] text-white' 
                        : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {phase.statut_paiement}
                      </span>
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