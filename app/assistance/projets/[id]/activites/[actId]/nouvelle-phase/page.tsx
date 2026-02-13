"use client";
import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Target, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
export const runtime = 'edge';

export default function NouvellePhaseAssistance({ params }: { params: Promise<{ id: string, actId: string }> }) {
  const { id, actId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [experts, setExperts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nom: '',
    expert_id: '',
    date_fin: ''
  });

  useEffect(() => {
    fetchExperts();
  }, []);

  async function fetchExperts() {
    const { data } = await supabase.from('profils').select('id, nom, titre').eq('role', 'expert');
    if (data) setExperts(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('phases').insert([{
      nom: formData.nom,
      activite_id: actId,
      expert_id: formData.expert_id,
      statut_avancement: 'en_attente'
    }]);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Phase assignée avec succès !");
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

          <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 italic">
            Assigner une <span className="text-[#00AEEF]">Mission</span>
          </h1>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
            {/* NOM DE LA PHASE */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Intitulé de la tâche</label>
              <div className="relative">
                <Target className="absolute left-5 top-5 text-[#00AEEF]" size={20} />
                <input type="text" placeholder="Ex: Rapport d'analyse terrain" required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-[#00AEEF] text-gray-900"
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            {/* CHOIX DE L'EXPERT */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Expert Responsable</label>
              <div className="relative">
                <UserPlus className="absolute left-5 top-5 text-[#7DB95C]" size={20} />
                <select required
                  className="w-full pl-14 p-5 bg-gray-50 rounded-3xl font-black border-none outline-none focus:ring-2 focus:ring-[#7DB95C] text-gray-900 appearance-none"
                  onChange={(e) => setFormData({...formData, expert_id: e.target.value})}
                >
                  <option value="">Sélectionner un expert</option>
                  {experts.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.nom} ({ex.titre})</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black hover:bg-[#7DB95C] text-white py-6 rounded-[2rem] font-black text-sm transition-all shadow-xl uppercase tracking-widest">
              {loading ? <Loader2 className="animate-spin mx-auto"/> : "LANCER LA MISSION"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
