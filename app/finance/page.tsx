"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Wallet, TrendingUp, Users, ArrowUpRight, 
  ArrowDownRight, DollarSign, PieChart, 
  Receipt, Landmark, AlertCircle, 
  Activity, Briefcase, FileText, Diamond // Ajout de Diamond pour l'investissement
} from 'lucide-react';

export default function FinanceNSIK() {
  const [loading, setLoading] = useState(true);
  const [projetsDetail, setProjetsDetail] = useState<any[]>([]);
  const [chargesDetail, setChargesDetail] = useState<any[]>([]);
  const [investDetail, setInvestDetail] = useState<any[]>([]); // Nouvel état
  const [stats, setStats] = useState({
    caEncaisse: 0,
    caPrevu: 0,
    creancesClients: 0,
    totalDettesExperts: 0,
    chargesFixes: 0,
    totalInvestissements: 0, // Nouveau stat
    margeNette: 0
  });

  const fetchFinanceData = async () => {
    setLoading(true);
    
    try {
        const { data: projets } = await supabase.from('projets').select('*, clients(nom)');
        const { data: activites } = await supabase.from('activites').select('id, projet_id');
        const { data: phases } = await supabase.from('phases').select('activite_id, montant_expert');
        const { data: depenses } = await supabase.from('depenses_projets').select('*').order('date_depense', { ascending: false });
        const { data: investissements } = await supabase.from('investissements').select('*'); // Récupération des investissements

        if (projets) {
            let globalEncaisse = 0;
            let globalPrevu = 0;
            let globalDetteClient = 0;

            const detailTransforme = projets.map(proj => {
                const estPayeAuto = proj.type_projet === 'standard';
                const encaisseSurCeProjet = estPayeAuto ? Number(proj.montant_total || 0) : Number(proj.montant_paye || 0);
                const resteAPayer = Number(proj.montant_total || 0) - encaisseSurCeProjet;
                
                const idsActivitesDuProjet = (activites || []).filter(act => act.projet_id === proj.id).map(act => act.id);
                const partExperts = (phases || []).filter(ph => idsActivitesDuProjet.includes(ph.activite_id)).reduce((sum, ph) => sum + (Number(ph.montant_expert) || 0), 0);

                globalEncaisse += encaisseSurCeProjet;
                globalPrevu += Number(proj.montant_total || 0);
                globalDetteClient += resteAPayer;

                return {
                    ...proj,
                    encaisseReel: encaisseSurCeProjet,
                    detteClient: resteAPayer,
                    partExperts: partExperts,
                    margeBruteProjet: encaisseSurCeProjet - partExperts
                };
            });

            const totalGlobalExperts = (phases || []).reduce((acc, p) => acc + (Number(p.montant_expert) || 0), 0);
            const totalChargesStructure = (depenses || []).reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
            const totalInvest = (investissements || []).reduce((acc, inv) => acc + (Number(inv.montant_total) || 0), 0);

            setStats({
                caEncaisse: globalEncaisse,
                caPrevu: globalPrevu,
                creancesClients: globalDetteClient,
                totalDettesExperts: totalGlobalExperts,
                chargesFixes: totalChargesStructure,
                totalInvestissements: totalInvest,
                // LE CALCUL DU BÉNÉFICE NET : CA - Experts - Charges Fixes - Investissements
                margeNette: globalEncaisse - totalGlobalExperts - totalChargesStructure - totalInvest
            });

            setProjetsDetail(detailTransforme);
            setChargesDetail(depenses || []);
            setInvestDetail(investissements || []);
        }
    } catch (error) {
        console.error("Erreur finance:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchFinanceData(); }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] animate-pulse text-2xl uppercase italic text-center p-10">Actualisation du bilan NSIK...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Finance <span className="text-[#00AEEF]">Direction</span></h1>
            <div className="bg-white px-6 py-2 rounded-2xl border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest italic text-gray-400">Flux de Trésorerie</div>
        </header>

        {/* INDICATEURS RÉVISÉS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-xl border-b-8 border-[#7DB95C]">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Cash Réel (Encaissé)</p>
            <h2 className="text-3xl font-black">{stats.caEncaisse.toLocaleString()} <span className="text-xs italic">F</span></h2>
            <div className="mt-4 flex items-center gap-2 text-[#7DB95C] text-[10px] font-black uppercase"><Landmark size={14}/> Trésorerie brute</div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm border-b-8 border-purple-500">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Investissements</p>
            <h2 className="text-3xl font-black text-purple-600">{stats.totalInvestissements.toLocaleString()} <span className="text-xs font-black text-gray-400">F</span></h2>
            <div className="mt-4 flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase italic"><Diamond size={14}/> Actifs acquis</div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm border-b-8 border-red-500">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Dépenses (Experts + Fixes)</p>
            <h2 className="text-3xl font-black text-red-600">{(stats.totalDettesExperts + stats.chargesFixes).toLocaleString()} <span className="text-xs text-gray-400 font-black">F</span></h2>
            <div className="mt-4 flex items-center gap-2 text-red-400 text-[10px] font-black uppercase italic"><Briefcase size={14}/> Sorties</div>
          </div>

          <div className={`p-8 rounded-[3rem] border-2 shadow-sm border-b-8 ${stats.margeNette >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Bénéfice Net (APRÈS INV.)</p>
            <h2 className={`text-3xl font-black ${stats.margeNette >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {stats.margeNette.toLocaleString()} <span className="text-xs font-black">F</span>
            </h2>
            <div className="mt-4 flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase italic"><TrendingUp size={14}/> Solde final</div>
          </div>
        </div>

        {/* SECTION DES INVESTISSEMENTS (NOUVEAU) */}
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-purple-50/30">
                <div className="flex items-center gap-3">
                    <Diamond className="text-purple-500" size={24} />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Détail des Investissements</h3>
                </div>
                <span className="text-[10px] font-black text-purple-600 bg-purple-100 px-4 py-1 rounded-full uppercase">Capital Immobilisé</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investDetail.map(inv => (
                    <div key={inv.id} className="p-6 bg-gray-50 rounded-[2.5rem] border-2 border-transparent hover:border-purple-200 transition-all flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase italic">Actif</p>
                            <p className="font-black uppercase text-xs">{inv.nom}</p>
                        </div>
                        <p className="font-black text-purple-600">{inv.montant_total.toLocaleString()} F</p>
                    </div>
                ))}
            </div>
        </div>

        {/* TABLEAU DES MARGES PROJETS */}
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                <Activity className="text-[#00AEEF]" size={24} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Analyse de Rentabilité Projets</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                            <th className="p-6">Projet</th>
                            <th className="p-6">Encaissé</th>
                            <th className="p-6">Experts</th>
                            <th className="p-6 text-right">Marge Brute</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {projetsDetail.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-all">
                                <td className="p-6">
                                    <p className="font-black uppercase italic leading-tight text-xs">{p.nom}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{p.clients?.nom}</p>
                                </td>
                                <td className="p-6 font-black text-xs">{(p.encaisseReel || 0).toLocaleString()} F</td>
                                <td className="p-6 font-bold text-red-400 text-xs">-{(p.partExperts || 0).toLocaleString()} F</td>
                                <td className="p-6 text-right font-black text-[#7DB95C] text-xs">{(p.margeBruteProjet || 0).toLocaleString()} F</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* CHARGES DE STRUCTURE */}
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-900 text-white flex items-center gap-3">
                <PieChart className="text-[#00AEEF]" size={24} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Dépenses de Structure</h3>
            </div>
            <div className="p-8 space-y-3">
                {chargesDetail.map(d => (
                    <div key={d.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-[2rem]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-400"><FileText size={16}/></div>
                            <p className="text-xs font-black uppercase italic">{d.motif}</p>
                        </div>
                        <span className="font-black text-red-600 text-xs">-{(d.montant || 0).toLocaleString()} F</span>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}