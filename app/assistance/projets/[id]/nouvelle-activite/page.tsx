"use client";
import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Calendar, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
export const runtime = 'edge';

export default function NouvelleActiviteAssistance({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projetInfos, setProjetInfos] = useState<any>(null);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    nom: '',
    delai_direction: ''
  });

  useEffect(() => {
    const fetchProjet = async () => {
      const { data } = await supabase.from('projets').select('*').eq('id', id).single();
      if (data) setProjetInfos(data);
    };
    fetchProjet();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // L'assistance crée l'activité SANS gérer le montant (montant par défaut à 0 ou géré plus tard)
    const { error } = await supabase.from('activites').insert([{
      nom: formData.nom,
      delai_direction: formData.delai_direction,
      projet_id: id,
      montant: 0, // L'assistance ne gère pas l'argent
      statut: 'paye' // Statut technique par défaut
    }]);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Étape de production ajoutée !");
      router.push(`/assistance/projets/${id}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{role: 'assistance', nom: 'Service Assistance'}} />
      
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/assistance/projets/${id}`} className="flex items-center gap-2 text-gray-400 mb-6 font-bold uppercase text-[10px] tracking-widest hover:text-[#00AEEF]">
            <ArrowLeft size={16} /> Annuler
          </Link>

          <div className="mb-10">
             <div className="flex items-center gap-3 text-[#00AEEF] mb-2">
                <ClipboardCheck size={20} />
                <span className="font-black uppercase text-[10px] tracking-[0.3em]">Planification</span>
             </div>
             <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 italic">
               Ajouter une <span className="text-[#00AEEF]">Étape</span>
             </h1>
             <p className="text-gray-400 font-bold text-xs mt-1">Projet : {projetInfos?.nom}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
            {/* NOM DE L'ACTIVITÉ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Désignation de l'étape technique</label>
              <div className="relative">
                <Layers className="absolute left-5 top-5 text-[#00AEEF]" size={20} />
                <input type="text" placeholder="ex: Étude de structure, Plan de masse..." required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900"
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            {/* ÉCHÉANCE */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Délai limite pour l'équipe</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-5 text-gray-400" size={20} />
                <input type="date" required
                  min={today}
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900"
                  onChange={(e) => setFormData({...formData, delai_direction: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black hover:bg-[#00AEEF] text-white py-6 rounded-[2rem] font-black text-sm transition-all shadow-xl uppercase tracking-[0.2em] active:scale-95">
              {loading ? "ENREGISTREMENT..." : "CONFIRMER L'ÉTAPE"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
