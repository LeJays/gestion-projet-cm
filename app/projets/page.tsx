"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { Calendar, MapPin, Plus, LayoutGrid, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ListeProjetsNSIK() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProjets();
  }, []);

  async function fetchProjets() {
    const { data } = await supabase.from('projets').select('*');
    if (data) {
      const trie = data.sort((a, b) => {
        const aujourdhui = new Date();
        const delaiA = (new Date(a.delai_livraison).getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24);
        const delaiB = (new Date(b.delai_livraison).getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24);

        if (a.priorite_interne > b.priorite_interne) return -1;
        if (a.priorite_interne < b.priorite_interne) return 1;

        const alerteA = delaiA <= 14 ? 1 : 0;
        const alerteB = delaiB <= 14 ? 1 : 0;
        if (alerteA > alerteB) return -1;
        if (alerteA < alerteB) return 1;

        return 0;
      });
      setProjets(trie);
    }
    setLoading(false);
  }

  const getStatutStyle = (delai: string, urgent: boolean) => {
    if (urgent) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'URGENCE DIRECTION', icon: <AlertTriangle size={28}/> };
    
    const diffJours = Math.ceil((new Date(delai).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffJours <= 14) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'ALERTE ÉCHÉANCE', icon: <Clock size={28}/> };
    return { color: 'text-[#7DB95C]', bg: 'bg-green-50', border: 'border-green-200', label: 'DOSSIER EN COURS', icon: <LayoutGrid size={28}/> };
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{role: 'direction', nom: 'James'}} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Projets & Chantiers</h1>
            <p className="text-gray-400 font-bold text-xs mt-2 tracking-[0.3em] uppercase italic">Tableau de bord de suivi</p>
          </div>

          <button onClick={() => router.push('/projets/nouveau')} 
            className="w-20 h-20 bg-[#00AEEF] text-white rounded-[2.2rem] flex flex-col items-center justify-center hover:bg-black transition-all shadow-xl active:scale-90 group">
            <Plus size={30} className="group-hover:rotate-90 transition-transform" />
            <span className="text-[9px] font-black mt-1 uppercase">Ouvrir</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projets.map((p) => {
            const style = getStatutStyle(p.delai_livraison, p.priorite_interne > 0);
            
            return (
              <div 
                key={p.id} 
                onClick={() => router.push(`/projets/${p.id}`)}
                className="group relative bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[380px]"
              >
                <div className={`absolute top-8 right-8 p-2 rounded-xl ${style.bg} ${style.color}`}>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
                
                <div>
                  <div className={`w-20 h-20 ${style.bg} ${style.color} rounded-[1.8rem] flex items-center justify-center border-2 ${style.border} mb-8 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-500`}>
                    {style.icon}
                  </div>

                  <div className="space-y-3">
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${style.color}`}>
                      {style.label}
                    </span>
                    <h3 className="text-3xl font-black text-gray-900 uppercase leading-[1.1] pr-10">
                      {p.nom}
                    </h3>
                    <div className="inline-flex px-4 py-1.5 bg-gray-100 text-gray-500 text-[11px] font-black rounded-xl uppercase tracking-tighter">
                      Type: {p.type_projet}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                      <MapPin size={18} className="text-[#00AEEF]" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-tight">{p.localisation}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                      <Calendar size={18} className="text-[#00AEEF]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Date de livraison</p>
                      <p className="font-black text-sm text-gray-700">{new Date(p.delai_livraison).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}