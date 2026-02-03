"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { Plus, Phone, Mail, User, Loader2, Trash2, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ListeClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('nom', { ascending: true });

    if (error) {
      console.error("Erreur de chargement:", error.message);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  }

  // Fonction pour supprimer
  async function deleteClient(id: string, nom: string) {
    if (confirm(`Voulez-vous vraiment supprimer le client ${nom} ?`)) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        alert("Action impossible : ce client est lié à un projet.");
      } else {
        setClients(clients.filter(c => c.id !== id));
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{role: 'direction', nom: 'James'}} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Annuaire Clients</h1>
            <p className="text-[#7DB95C] font-bold text-sm italic">Base de données NSIK'ARCHI</p>
          </div>
          <Link 
            href="/clients/nouveau" 
            className="bg-[#00AEEF] hover:bg-[#7DB95C] text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={20} /> AJOUTER UN CLIENT
          </Link>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00AEEF] mb-4" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div key={client.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-50 transition-all duration-300 group relative overflow-hidden">
                
                {/* Petit badge décoratif */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#7DB95C]/10 to-transparent rounded-bl-full"></div>
                
                {/* BOUTONS D'ACTION (Apparaissent au survol) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <Link href={`/clients/modifier/${client.id}`} className="p-2 bg-blue-50 text-[#00AEEF] rounded-xl hover:bg-[#00AEEF] hover:text-white transition shadow-sm">
                    <Edit3 size={16} />
                  </Link>
                  <button onClick={() => deleteClient(client.id, client.nom)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gray-50 text-[#00AEEF] rounded-2xl flex items-center justify-center font-black text-2xl border border-gray-100 group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
                    {client.nom ? client.nom.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Client ID</span>
                    <span className="text-[10px] font-bold text-[#7DB95C]">NSIK-{client.id.substring(0, 4).toUpperCase()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-800 uppercase mb-1 truncate pr-10">
                  {client.nom}
                </h3>
                
                <div className="inline-block px-3 py-1 bg-blue-50 text-[#00AEEF] text-[10px] font-black rounded-lg uppercase mb-4">
                   Paiement: {client.mode_prefere || 'cash'}
                </div>

                <div className="space-y-3 border-t border-gray-50 pt-5">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      <Phone size={16} className="text-[#00AEEF]" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{client.numero || 'Aucun numéro'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      <Mail size={16} className="text-[#00AEEF]" />
                    </div>
                    <span className="font-semibold text-sm truncate">{client.mail || 'Pas d\'email'}</span>
                  </div>
                </div>
              </div>
            ))}

            {clients.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-gray-50">
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Votre annuaire est vide</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}