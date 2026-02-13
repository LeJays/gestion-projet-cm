"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Archive, 
  Search, 
  History, 
  CheckCircle2, 
  UserX, 
  FolderArchive,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function ArchivesPage() {
  const [projetsTermines, setProjetsTermines] = useState<any[]>([]);
  const [clientsHistorique, setClientsHistorique] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArchives();
  }, []);

  async function fetchArchives() {
    setLoading(true);
    // 1. Récupérer les projets terminés
    const { data: proj } = await supabase
      .from('projets')
      .select('*, clients(nom)')
      .eq('statut_projet', 'termine')
      .order('created_at', { ascending: false });

    // 2. Récupérer les clients (Note: Si tu as une colonne 'archive' c'est mieux, 
    // sinon ici on récupère tous les clients pour l'annuaire historique)
    const { data: clie } = await supabase
      .from('clients')
      .select('*')
      .order('nom', { ascending: true });

    if (proj) setProjetsTermines(proj);
    if (clie) setClientsHistorique(clie);
    setLoading(false);
  }

  const filteredProjets = projetsTermines.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clients?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-gray-400" size={40} />
      <div className="text-gray-900 font-black text-[10px] uppercase tracking-[0.4em]">Ouverture des coffres...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3 text-[#00AEEF] mb-2">
              <Archive size={24} />
              <span className="font-black uppercase text-[10px] tracking-[0.3em]">Coffre-Fort NSIK</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic text-gray-900">
              Archives <span className="text-gray-400">&</span> Historique
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un dossier..."
              className="pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl w-80 font-bold outline-none focus:border-[#00AEEF] transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE: PROJETS TERMINÉS (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-gray-400 mb-4">
              <CheckCircle2 size={16} className="text-[#7DB95C]" /> Projets Livrés ({filteredProjets.length})
            </h2>
            
            {filteredProjets.map((p) => (
              <div key={p.id} className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm flex items-center justify-between group hover:border-[#7DB95C]/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-[#7DB95C] transition-colors">
                    <FolderArchive size={30} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-lg leading-tight">{p.nom}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Client: {p.clients?.nom || 'N/A'}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[9px] font-black bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">Livré le {new Date(p.created_at).toLocaleDateString()}</span>
                       <span className="text-[9px] font-black text-[#7DB95C] uppercase italic">{Number(p.montant_total).toLocaleString()} F CFA</span>
                    </div>
                  </div>
                </div>
                <button className="p-4 bg-gray-50 rounded-2xl text-gray-300 hover:bg-[#7DB95C] hover:text-white transition-all">
                  <ArrowUpRight size={20} />
                </button>
              </div>
            ))}

            {filteredProjets.length === 0 && (
              <div className="py-20 text-center bg-gray-100/50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <p className="font-black uppercase text-gray-300 tracking-widest text-xs">Aucun projet archivé</p>
              </div>
            )}
          </div>

          {/* COLONNE DROITE: CLIENTS PASSIFS / SUPPRIMÉS */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-gray-400 mb-4">
              <UserX size={16} /> Annuaire Clients
            </h2>
            
            <div className="bg-white rounded-[3.5rem] p-8 border-2 border-gray-100 shadow-sm">
              <div className="space-y-6">
                {clientsHistorique.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
                      {c.nom.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-black uppercase text-[11px] leading-none group-hover:text-[#00AEEF] transition-colors">{c.nom}</p>
                      <p className="text-[9px] font-bold text-gray-400 mt-1">{c.mail || 'Pas d\'email'}</p>
                    </div>
                    <History size={14} className="text-gray-200 group-hover:text-gray-400" />
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00AEEF] transition-all">
                Exporter l'historique CSV
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}