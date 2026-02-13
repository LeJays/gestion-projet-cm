"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, ChevronLeft, LayoutGrid, Layers, 
  ExternalLink, Loader2, Settings2, Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetailProjetAssistance({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [projet, setProjet] = useState<any>(null);
  const [activites, setActivites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailProjet();
  }, [id]);

  async function fetchDetailProjet() {
    const { data: p } = await supabase.from('projets').select('*, clients(nom)').eq('id', id).single();
    const { data: a } = await supabase.from('activites').select('*, phases(*, profils(nom))').eq('projet_id', id);
    
    if (p) setProjet(p);
    if (a) setActivites(a);
    setLoading(false);
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#00AEEF]" size={30} />
      <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 italic">Chargement...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'assistance', nom: 'Service Assistance' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <Link href="/assistance/projets" className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-black transition-colors w-fit">
          <ChevronLeft size={16} /> Retour à la liste
        </Link>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 text-[#00AEEF] mb-3">
              <Briefcase size={18} />
              <span className="font-black uppercase text-[9px] tracking-[0.3em]">Gestion de Production</span>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
              {projet?.nom}
            </h1>
            <p className="text-gray-400 font-bold text-sm mt-3 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#7DB95C]"></span> Client : {projet?.clients?.nom}
            </p>
          </div>

          <Link 
            href={`/assistance/projets/${id}/nouvelle-activite`}
            className="bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 hover:bg-[#00AEEF] transition-all shadow-xl text-[10px] uppercase tracking-widest group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Nouvelle Activité
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-10">
          {activites && activites.length > 0 ? activites.map((act) => (
            <div key={act.id} className="bg-white rounded-[4rem] border-2 border-gray-100 shadow-sm overflow-hidden group hover:border-[#00AEEF]/20 transition-all">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#00AEEF] shadow-sm border border-gray-100">
                    <LayoutGrid size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic leading-none">{act.nom}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Étape technique</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                    {/* LIEN VERS CRÉATION DE PHASE */}
                    <Link 
                      href={`/assistance/projets/${id}/activites/${act.id}/nouvelle-phase`}
                      className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-gray-400 hover:text-[#7DB95C] hover:border-[#7DB95C] transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest shadow-sm"
                    >
                        <Plus size={16} /> Créer Phase
                    </Link>

                    {/* LIEN VERS GESTION DES PHASES */}
                    <Link 
                      href={`/assistance/projets/${id}/activites/${act.id}/gestion`}
                      className="bg-gray-900 text-white p-4 rounded-2xl flex items-center gap-2 font-black text-[9px] uppercase tracking-widest hover:bg-[#00AEEF] transition-all shadow-lg"
                    >
                        <Settings2 size={16} /> Gérer les Phases
                    </Link>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {act.phases && act.phases.length > 0 ? act.phases.map((ph: any) => (
                  <div key={ph.id} className="p-6 bg-gray-50 rounded-[2.5rem] border-2 border-transparent hover:border-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                            ph.statut_avancement === 'termine' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-[#00AEEF]'
                        }`}>
                            {ph.statut_avancement.replace('_', ' ')}
                        </span>
                        {ph.preuve_url && <ExternalLink size={14} className="text-[#00AEEF]" />}
                    </div>
                    <p className="font-black text-xs uppercase mb-2 tracking-tight">{ph.nom}</p>
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[8px] font-black italic border border-gray-200 text-gray-400 uppercase">
                          {ph.profils?.nom?.substring(0,2) || '??'}
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                          {ph.profils?.nom || 'Non assigné'}
                        </p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-4 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Aucune phase définie</p>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-24 bg-white rounded-[5rem] border-2 border-dashed border-gray-100">
               <Layers className="mx-auto text-gray-200 mb-4" size={48} />
               <p className="font-black text-gray-300 uppercase italic tracking-widest">Le planning de ce projet est vide</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}