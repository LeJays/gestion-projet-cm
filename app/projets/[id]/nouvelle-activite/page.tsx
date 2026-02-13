"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Wallet, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
export const runtime = 'edge';

export default function NouvelleActivite() {
  const { id } = useParams(); 
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projetInfos, setProjetInfos] = useState<any>(null);
  const [budgetRestant, setBudgetRestant] = useState<number | null>(null);
  
  // Date d'aujourd'hui pour restreindre le calendrier
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    nom: '',
    montant: 0,
    statut: 'prepaye',
    delai_direction: ''
  });

  // RÉCUPÉRATION DU PROJET ET CALCUL DU SEUIL
  useEffect(() => {
    const fetchBudgetInfo = async () => {
      const { data: proj } = await supabase.from('projets').select('*').eq('id', id).single();
      const { data: acts } = await supabase.from('activites').select('montant').eq('projet_id', id);
      
      if (proj) {
        setProjetInfos(proj);
        if (proj.type_projet === 'standard') {
          const cumul = acts?.reduce((acc, curr) => acc + (Number(curr.montant) || 0), 0) || 0;
          setBudgetRestant(proj.montant_total - cumul);
          // Force le statut à 'paye' car le projet global est déjà payé
          setFormData(prev => ({ ...prev, statut: 'paye' }));
        }
      }
    };
    fetchBudgetInfo();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // VÉRIFICATION DU SEUIL (MODE PAYÉ / STANDARD)
    if (projetInfos?.type_projet === 'standard' && budgetRestant !== null) {
      if (formData.montant > budgetRestant) {
        alert(`ALERTE BUDGET : Il ne reste que ${budgetRestant.toLocaleString()} FCFA sur le budget total de ce projet.`);
        return;
      }
    }

    setLoading(true);

    // 1. INSERTION DE L'ACTIVITÉ
    const { error: errorAct } = await supabase.from('activites').insert([{
      nom: formData.nom,
      montant: formData.montant,
      statut: projetInfos?.type_projet === 'standard' ? 'paye' : formData.statut,
      delai_direction: formData.delai_direction,
      projet_id: id
    }]);

    if (errorAct) {
      alert("Erreur : " + errorAct.message);
    } else {
      // 2. LOGIQUE DE DETTE (MODE PRÉPAYÉ / RECOMMANDATION)
      if (projetInfos?.type_projet === 'recommandation') {
        let nouveauMontantProjet = projetInfos.montant_total || 0;
        
        // Si marqué 'prepaye', c'est une dette qui s'ajoute
        if (formData.statut === 'prepaye') {
          nouveauMontantProjet += formData.montant;
        } 
        // Note: Si James met 'paye' en mode recommandation, on considère que l'argent est reçu, 
        // donc la dette totale (montant_total) n'augmente pas ou est déjà compensée.

        await supabase.from('projets').update({ montant_total: nouveauMontantProjet }).eq('id', id);
      }
      
      alert("Activité enregistrée avec succès !");
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
            Lancer une <span className="text-[#00AEEF]">Activité</span>
          </h1>

          {/* INDICATEUR DE BUDGET POUR JAMES */}
          {projetInfos?.type_projet === 'standard' && budgetRestant !== null && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-[#00AEEF] rounded-r-2xl">
              <p className="text-[10px] font-black text-[#00AEEF] uppercase tracking-widest">Enveloppe disponible (Mode Payé)</p>
              <p className="text-xl font-black">{budgetRestant.toLocaleString()} FCFA <span className="text-xs text-gray-400">/ {projetInfos.montant_total.toLocaleString()}</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Désignation de l'étape</label>
              <div className="relative">
                <Layers className="absolute left-5 top-5 text-[#00AEEF]" size={20} />
                <input type="text" placeholder="ex: Étude géotechnique" required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900 shadow-inner"
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Coût Activité (FCFA)</label>
                <div className="relative">
                  <Wallet className="absolute left-5 top-5 text-[#7DB95C]" size={20} />
                  <input type="number" placeholder="0" required
                    className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-black border-none outline-none focus:ring-2 focus:ring-[#7DB95C] text-gray-900 shadow-inner"
                    onChange={(e) => setFormData({...formData, montant: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Échéance (Limitée au projet)</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-5 text-gray-400" size={20} />
                  <input type="date" required
                    min={today}
                    max={projetInfos?.delai_livraison}
                    className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 shadow-inner"
                    onChange={(e) => setFormData({...formData, delai_direction: e.target.value})} />
                </div>
              </div>
            </div>

            {/* LOGIQUE DE PAIEMENT CONDITIONNELLE */}
            {projetInfos?.type_projet === 'standard' ? (
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-3xl flex items-center gap-4">
                <ShieldCheck className="text-green-600" size={28} />
                <div>
                  <p className="font-black text-xs text-green-700 uppercase">MODE PAYÉ ACTIF</p>
                  <p className="text-[10px] text-green-600 font-bold italic">Le projet est déjà financé, pas de choix requis.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Mode de règlement de cette activité</label>
                <select 
                  className="w-full p-5 bg-gray-50 rounded-3xl font-black text-gray-900 border-none outline-none focus:ring-2 focus:ring-[#00AEEF] shadow-inner"
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value})}
                >
                  <option value="prepaye">PRÉPAYÉ (Ajoute à la dette client)</option>
                  <option value="paye">PAYÉ (Règlement déjà reçu)</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-black text-white py-6 rounded-[2rem] font-black text-lg transition-all shadow-xl uppercase tracking-widest active:scale-95">
              {loading ? "TRAITEMENT BUDGÉTAIRE..." : "VALIDER L'ACTIVITÉ"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
