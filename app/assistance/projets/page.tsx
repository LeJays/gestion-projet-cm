"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Briefcase, 
  ChevronRight, 
  Search, 
  Layers, 
  Clock, 
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';

export default function AssistanceProjetsListe() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProjets();
  }, []);

  async function fetchProjets() {
    // On récupère les projets et le nom du client lié
    const { data, error } = await supabase
      .from('projets')
      .select('*, clients(nom)')
      .order('created_at', { ascending: false });
    
    if (data) setProjets(data);
    setLoading(false);
  }

  // Filtrage pour la barre de recherche
  const projetsFiltrés = projets.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.clients?.nom.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] animate-pulse italic">CHARGEMENT DES DOSSIERS...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* On passe le profil assistance pour voir le bon menu */}
      <Sidebar userProfile={{ role: 'assistance', nom: 'Service Assistance' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-gray-900">
              Gestion des <span className="text-[#00AEEF]">Projets</span>
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Flux de production NSIK'ARCHI</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un projet ou un client..."
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-[#00AEEF] outline-none font-bold text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* GRILLE DES PROJETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projetsFiltrés.map((proj) => (
            <Link href={`/assistance/projets/${proj.id}`} key={proj.id} className="group">
              <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00AEEF]/30 transition-all relative overflow-hidden h-full flex flex-col">
                
                {/* Badge Statut */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-gray-900 rounded-[1.8rem] flex items-center justify-center text-white group-hover:bg-[#00AEEF] transition-colors duration-500 shadow-lg">
                    <FolderOpen size={28} />
                  </div>
                  <span className={`text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${
                    proj.statut_projet === 'termine' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-[#00AEEF]'
                  }`}>
                    {proj.statut_projet || 'En cours'}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black uppercase italic leading-tight group-hover:text-[#00AEEF] transition-colors">
                    {proj.nom}
                  </h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-[#7DB95C]"></span> {proj.clients?.nom || 'Client Externe'}
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black italic">N</div>
                       <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-black italic text-gray-400">S</div>
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter ml-2">Suivi Actif</span>
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projetsFiltrés.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
             <Briefcase className="mx-auto text-gray-200 mb-4" size={48} />
             <p className="font-black text-gray-400 uppercase italic">Aucun projet trouvé</p>
          </div>
        )}
      </main>
    </div>
  );
}