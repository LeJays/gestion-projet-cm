"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NouvelleActivite() {
  const { id } = useParams(); 
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    montant: 0, // Nom corrigé selon ton schéma
    statut: 'prepaye', // Nom corrigé (tu as dit 'statut' dans ton schéma, pas 'statut_paiement')
    delai_direction: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // On envoie les données vers les colonnes EXACTES de ta table
    const { error } = await supabase.from('activites').insert([{
      nom: formData.nom,
      montant: formData.montant, // Corrigé
      statut: formData.statut,   // Corrigé
      delai_direction: formData.delai_direction,
      projet_id: id
    }]);

    if (error) {
      alert("Erreur Supabase : " + error.message);
      console.log(error);
    } else {
      alert("Activité enregistrée !");
      router.push(`/projets/${id}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{role: 'direction', nom: 'James'}} />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <Link href={`/projets/${id}`} className="flex items-center gap-2 text-gray-400 mb-6 font-bold uppercase text-[10px] tracking-widest hover:text-[#00AEEF]">
            <ArrowLeft size={16} /> Annuler et retour
          </Link>

          <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 text-gray-900">
            Ajouter une Activité
          </h1>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
            
            {/* NOM */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Désignation</label>
              <div className="relative">
                <Layers className="absolute left-5 top-5 text-[#00AEEF]" size={20} />
                <input type="text" placeholder="ex: Plans de fondation" required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900"
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MONTANT CORRIGÉ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Montant (FCFA)</label>
                <div className="relative">
                  <Wallet className="absolute left-5 top-5 text-[#7DB95C]" size={20} />
                  <input type="number" placeholder="0" required
                    className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-black border-none outline-none focus:ring-2 focus:ring-[#7DB95C] text-gray-900"
                    onChange={(e) => setFormData({...formData, montant: Number(e.target.value)})} />
                </div>
              </div>

              {/* DELAI */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Date limite</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-5 text-gray-400" size={20} />
                  <input type="date" required
                    className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    onChange={(e) => setFormData({...formData, delai_direction: e.target.value})} />
                </div>
              </div>
            </div>

            {/* STATUT CORRIGÉ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Règlement Client</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-3xl font-black text-gray-900 border-none outline-none focus:ring-2 focus:ring-[#00AEEF]"
                onChange={(e) => setFormData({...formData, statut: e.target.value})}
              >
                <option value="prepaye">PRÉPAYÉ (Dette/Facture)</option>
                <option value="paye">PAYÉ (OK)</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-gray-900 text-white py-6 rounded-[2rem] font-black text-lg transition-all shadow-xl uppercase tracking-widest">
              {loading ? "ENREGISTREMENT..." : "LANCER L'ACTIVITÉ"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}