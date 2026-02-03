"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { UserPlus, MapPin, AlertCircle, Image as ImageIcon, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NouveauProjetNSIK() {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nom: '',
    client_id: '',
    type_projet: 'standard', // 'standard' ou 'recommandation'
    montant_total: 0,
    localisation: '',
    delai_livraison: '',
    priorite_urgente: false, // Définit si le projet passe devant les autres
    statut_paiement: 'prepaye'
  });

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('id, nom');
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = {
      nom: formData.nom,
      client_id: formData.client_id,
      type_projet: formData.type_projet,
      localisation: formData.localisation,
      delai_livraison: formData.delai_livraison,
      statut_paiement: formData.statut_paiement,
      // Priorité : 100 pour urgent, 0 pour normal (trié par date d'arrivée par défaut)
      priorite_interne: formData.priorite_urgente ? 100 : 0,
      // Si recommandation, montant = 0 au départ (facture finale)
      montant_total: formData.type_projet === 'recommandation' ? 0 : formData.montant_total
    };

    const { error } = await supabase.from('projets').insert([dataToSubmit]);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("Dossier client ouvert avec succès !");
      router.push('/projets');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{role: 'direction', nom: 'James'}} />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Ouverture de Dossier</h1>
          <p className="text-[#00AEEF] font-bold text-sm tracking-widest">CRÉATION DU PROJET CLIENT</p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
          
          {/* LIGNE 1 : CLIENT & TYPE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Propriétaire (Client)</label>
              <select required className="w-full p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900"
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}>
                <option value="">Sélectionner le client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Type de Projet</label>
              <select className="w-full p-5 bg-[#00AEEF]/5 text-[#00AEEF] rounded-3xl font-black border-none outline-none"
                value={formData.type_projet}
                onChange={(e) => setFormData({...formData, type_projet: e.target.value})}>
                <option value="standard">PROJET STANDARD</option>
                <option value="recommandation">PROJET RECOMMANDATION</option>
              </select>
            </div>
          </div>

          {/* LIGNE 2 : NOM & LOCALISATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Désignation</label>
              <input type="text" placeholder="Nom du projet..." required
                className="w-full p-5 bg-gray-50 rounded-3xl font-semibold border-none text-gray-900"
                onChange={(e) => setFormData({...formData, nom: e.target.value})} />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Lieu du Projet</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 text-[#7DB95C]" size={20} />
                <input type="text" placeholder="Localisation (ex: Bonamoussadi, Douala)" required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-semibold border-none text-gray-900"
                  onChange={(e) => setFormData({...formData, localisation: e.target.value})} />
              </div>
            </div>
          </div>

          {/* LIGNE 3 : MONTANT & DELAI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Délai global de livraison</label>
              <input type="date" required className="w-full p-5 bg-gray-50 rounded-3xl font-bold border-none text-gray-900"
                onChange={(e) => setFormData({...formData, delai_livraison: e.target.value})} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                {formData.type_projet === 'recommandation' ? "Facturation (Dette)" : "Montant Total (Standard)"}
              </label>
              <input type="number" 
                disabled={formData.type_projet === 'recommandation'}
                placeholder={formData.type_projet === 'recommandation' ? "Calculé sur facture finale" : "Entrez le montant..."}
                className="w-full p-5 bg-gray-50 rounded-3xl font-black border-none text-gray-900 disabled:opacity-40"
                onChange={(e) => setFormData({...formData, montant_total: Number(e.target.value)})} />
            </div>
          </div>

          {/* PRIORITÉ */}
          <div className="flex items-center justify-between p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-orange-500" />
              <div>
                <p className="font-black text-sm uppercase">Marquer comme Projet Prioritaire</p>
                <p className="text-[10px] text-gray-500 font-bold">Passe au-dessus de la file d'attente (Urgence Direction)</p>
              </div>
            </div>
            <input type="checkbox" className="w-6 h-6 rounded-lg text-[#00AEEF] cursor-pointer"
                onChange={(e) => setFormData({...formData, priorite_urgente: e.target.checked})} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-[#7DB95C] text-white py-6 rounded-3xl font-black text-xl transition-all shadow-xl shadow-blue-100 uppercase tracking-tighter">
            {loading ? "ENREGISTREMENT..." : "OUVRIR LE DOSSIER CLIENT"}
          </button>
        </form>
      </main>
    </div>
  );
}