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
    type_projet: 'standard', // 'standard' = PAYÉ (Plafond), 'recommandation' = PREPAYÉ (Cumul)
    montant_total: 0,
    localisation: '',
    delai_livraison: '',
    priorite_urgente: false,
    statut_paiement: 'prepaye',
    statut_projet: 'en_attente'
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
      priorite_urgente: formData.priorite_urgente, 
      priorite_interne: formData.priorite_urgente ? 100 : 0, 
      statut_projet: 'en_attente',
      // En mode recommandation (prépayé), on part de 0 car le montant sera la somme des activités
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
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Ouverture de <span className="text-[#00AEEF]">Dossier</span></h1>
          <p className="text-gray-400 font-bold text-[10px] mt-2 tracking-[0.3em] uppercase italic">Configuration du modèle budgétaire NSIK</p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Propriétaire (Client)</label>
              <select required className="w-full p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900 shadow-inner"
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}>
                <option value="">Sélectionner le client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Modèle Budgétaire</label>
              <select className="w-full p-5 bg-[#00AEEF]/5 text-[#00AEEF] rounded-3xl font-black border-none outline-none focus:ring-2 focus:ring-[#00AEEF]"
                value={formData.type_projet}
                onChange={(e) => setFormData({...formData, type_projet: e.target.value})}>
                <option value="standard">BUDGET FIXE (Payé)</option>
                <option value="recommandation">DETTE CUMULATIVE (Prépayé)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Désignation du Projet</label>
              <input type="text" placeholder="Nom du projet..." required
                className="w-full p-5 bg-gray-50 rounded-3xl font-semibold border-none text-gray-900 focus:ring-2 focus:ring-[#00AEEF] shadow-inner"
                onChange={(e) => setFormData({...formData, nom: e.target.value})} />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Lieu du Projet</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 text-[#7DB95C]" size={20} />
                <input type="text" placeholder="Localisation (ex: Kribi)" required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-semibold border-none text-gray-900 focus:ring-2 focus:ring-[#00AEEF] shadow-inner"
                  onChange={(e) => setFormData({...formData, localisation: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Délai de livraison</label>
              <input type="date" required className="w-full p-5 bg-gray-50 rounded-3xl font-bold border-none text-gray-900 focus:ring-2 focus:ring-[#00AEEF] shadow-inner"
                onChange={(e) => setFormData({...formData, delai_livraison: e.target.value})} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                {formData.type_projet === 'recommandation' ? "Budget initial (Somme des activités)" : "Montant Nette Projet (Plafond)"}
              </label>
              <input type="number" 
                disabled={formData.type_projet === 'recommandation'}
                placeholder={formData.type_projet === 'recommandation' ? "Sera calculé via les activités" : "Ex: 5 000 000 FCFA"}
                className="w-full p-5 bg-gray-50 rounded-3xl font-black border-none text-gray-900 disabled:opacity-40 focus:ring-2 focus:ring-[#00AEEF] shadow-inner"
                value={formData.type_projet === 'recommandation' ? '' : formData.montant_total}
                onChange={(e) => setFormData({...formData, montant_total: Number(e.target.value)})} />
            </div>
          </div>

          <div className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 ${formData.priorite_urgente ? 'bg-orange-50 border-orange-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <AlertCircle className={formData.priorite_urgente ? "text-orange-500 animate-pulse" : "text-gray-400"} />
              <div>
                <p className="font-black text-sm uppercase">Marquer comme Priorité Direction</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-tighter uppercase italic">Alerte visuelle immédiate activée</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              className="w-8 h-8 rounded-xl text-[#00AEEF] border-none focus:ring-offset-0 cursor-pointer shadow-md"
              checked={formData.priorite_urgente}
              onChange={(e) => setFormData({...formData, priorite_urgente: e.target.checked})} 
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-black text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-xl hover:shadow-2xl shadow-blue-100 uppercase tracking-tighter active:scale-95 flex items-center justify-center gap-3">
            {loading ? "OUVERTURE EN COURS..." : "OUVRIR LE DOSSIER CLIENT"}
          </button>
        </form>
      </main>
    </div>
  );
}