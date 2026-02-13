"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  ClipboardList, CheckCircle2, Clock, UserPlus, 
  Briefcase, Activity, LayoutGrid, 
  ArrowRight, PlusCircle, Layers, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AssistanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [projets, setProjets] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPhases: 0, enAttente: 0, enCours: 0, terminees: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Requête optimisée pour éviter l'erreur 500
      const { data: projData, error } = await supabase
        .from('projets')
        .select(`
          id, 
          nom, 
          statut_projet,
          clients (nom),
          activites (
            id, 
            nom,
            phases (
              id, 
              nom, 
              statut_avancement, 
              profils (nom)
            )
          )
        `)
        .neq('statut_projet', 'termine');

      if (error) throw error;

      if (projData) {
        setProjets(projData);
        let total = 0, attente = 0, cours = 0, fini = 0;
        
        projData.forEach(p => {
          p.activites?.forEach((a: any) => {
            a.phases?.forEach((ph: any) => {
              total++;
              if (ph.statut_avancement === 'en_attente') attente++;
              else if (ph.statut_avancement === 'en_cours') cours++;
              else if (ph.statut_avancement === 'termine') fini++;
            });
          });
        });
        setStats({ totalPhases: total, enAttente: attente, enCours: cours, terminees: fini });
      }
    } catch (err: any) {
      console.error("Erreur critique:", err.message);
      alert("Erreur de connexion à la base de données. Veuillez rafraîchir.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="w-12 h-12 text-[#00AEEF] animate-spin" />
      <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 italic">Chargement du flux opérationnel...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'assistance', nom: 'Service Assistance' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3 text-[#00AEEF] mb-2">
              <ClipboardList size={20} />
              <span className="font-black uppercase text-[10px] tracking-[0.3em]">NSIK Operations</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
              Tableau <span className="text-[#00AEEF]">Opérationnel</span>
            </h1>
          </div>

          <Link href="/assistance/projets" className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#00AEEF] transition-all shadow-xl">
            <PlusCircle size={18} /> Gérer les dossiers
          </Link>
        </header>

        {/* INDICATEURS GÉANTS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-xl border-b-8 border-[#00AEEF]">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Phases Totales</p>
            <h2 className="text-4xl font-black italic">{stats.totalPhases}</h2>
            <div className="mt-4 flex items-center gap-2 text-[#00AEEF] text-[10px] font-black uppercase"><Layers size={14}/> Volume Travaux</div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm border-b-8 border-orange-400">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">En Attente</p>
            <h2 className="text-4xl font-black text-orange-600 italic">{stats.enAttente}</h2>
            <div className="mt-4 flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase"><Clock size={14}/> À démarrer</div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm border-b-8 border-blue-500">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">En Cours</p>
            <h2 className="text-4xl font-black text-blue-600 italic">{stats.enCours}</h2>
            <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase"><Activity size={14}/> Sur le terrain</div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm border-b-8 border-[#7DB95C]">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Terminées</p>
            <h2 className="text-4xl font-black text-[#7DB95C] italic">{stats.terminees}</h2>
            <div className="mt-4 flex items-center gap-2 text-[#7DB95C] text-[10px] font-black uppercase"><CheckCircle2 size={14}/> Prêt pour James</div>
          </div>
        </div>

        {/* LISTE DES PROJETS */}
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <LayoutGrid className="text-gray-400" size={20} />
                <h3 className="font-black uppercase text-xs tracking-[0.2em] text-gray-400">Suivi des activités en cours</h3>
            </div>

            {projets.map((proj) => (
                <div key={proj.id} className="bg-white rounded-[3.5rem] border-2 border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gray-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg">
                                <Briefcase size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{proj.nom}</h2>
                                <p className="text-[11px] font-bold text-[#00AEEF] uppercase tracking-widest mt-1">{proj.clients?.nom}</p>
                            </div>
                        </div>
                        <Link href={`/assistance/projets/${proj.id}`} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-[#00AEEF] transition-all">
                            Détails & Planning
                        </Link>
                    </div>

                    <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {proj.activites?.map((act: any) => (
                            <div key={act.id} className="space-y-4">
                                <div className="flex items-center gap-2 ml-4">
                                    <div className="w-2 h-2 rounded-full bg-[#00AEEF]"></div>
                                    <h4 className="font-black uppercase text-[10px] text-gray-400 tracking-widest">{act.nom}</h4>
                                </div>
                                
                                <div className="space-y-3">
                                    {act.phases?.map((ph: any) => (
                                        <div key={ph.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-gray-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${ph.statut_avancement === 'termine' ? 'bg-[#7DB95C]' : 'bg-orange-400 animate-pulse'}`}></div>
                                                <div>
                                                    <p className="font-black uppercase text-[11px] italic leading-none">{ph.nom}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1 uppercase mt-1">
                                                        <UserPlus size={10} /> {ph.profils?.nom || 'Non assigné'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <Link href={`/assistance/projets/${proj.id}/activites/${act.id}/gestion`} className="p-3 bg-white border border-gray-200 rounded-xl text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white transition-all shadow-sm">
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}