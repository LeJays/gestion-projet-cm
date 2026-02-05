"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  Image as ImageIcon, DollarSign, User, Trash2, Edit3, RefreshCcw, ChevronDown 
} from 'lucide-react';

export default function GestionPhasesDirection() {
  const { id, activiteId } = useParams();
  const router = useRouter();
  
  const [phases, setPhases] = useState<any[]>([]);
  const [activite, setActivite] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]); // Liste pour réassignation
  const [loading, setLoading] = useState(true);
  const [editingExpertId, setEditingExpertId] = useState<string | null>(null);

  useEffect(() => {
    fetchPhasesData();
    fetchExperts();
  }, [activiteId]);

  const fetchExperts = async () => {
    const { data } = await supabase.from('profils').select('id, nom').neq('role', 'direction');
    if (data) setExperts(data);
  };

  const fetchPhasesData = async () => {
    setLoading(true);
    const { data: act } = await supabase
      .from('activites')
      .select('nom, projets(nom)')
      .eq('id', activiteId)
      .single();
    setActivite(act);

    const { data: phs } = await supabase
      .from('phases')
      .select(`*, profils:expert_id (nom, telephone)`)
      .eq('activite_id', activiteId)
      .order('delai', { ascending: true });

    if (phs) setPhases(phs);
    setLoading(false);
  };

  const handleUpdateStatut = async (phase: any, nouveauStatut: string) => {
    let updateData: any = { statut_avancement: nouveauStatut };
    if (phase.statut_avancement === 'termine' && nouveauStatut === 'en_cours') {
      updateData.nb_modifications = (phase.nb_modifications || 0) + 1;
    }

    const { error } = await supabase.from('phases').update(updateData).eq('id', phase.id);
    if (!error) fetchPhasesData();
  };

  const updateExpert = async (phaseId: string, newExpertId: string) => {
    const { error } = await supabase.from('phases').update({ expert_id: newExpertId }).eq('id', phaseId);
    if (!error) {
      setEditingExpertId(null);
      fetchPhasesData();
    }
  };

  const deletePhase = async (phaseId: string) => {
    if(confirm("Confirmez-vous la suppression ?")) {
      const { error } = await supabase.from('phases').delete().eq('id', phaseId);
      if (!error) fetchPhasesData();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] bg-white text-2xl animate-pulse italic uppercase">Chargement Chantier...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <header className="mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#00AEEF] transition-all mb-4">
            <ArrowLeft size={14} /> Retour au projet
          </button>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#7DB95C] font-black text-xs uppercase tracking-[0.3em] mb-1">{activite?.projets?.nom}</p>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{activite?.nom}</h1>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-right">
              <p className="text-[10px] font-black uppercase text-gray-400 italic">Expertise engagée</p>
              <p className="text-2xl font-black text-[#00AEEF]">{phases.reduce((acc, p) => acc + (p.montant_expert || 0), 0).toLocaleString()} FCFA</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {phases.map((phase) => (
            <div key={phase.id} className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 shadow-sm group hover:border-gray-200 transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      phase.statut_avancement === 'termine' ? 'bg-green-100 text-green-600' : 
                      phase.statut_avancement === 'en_cours' ? 'bg-blue-100 text-[#00AEEF]' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {phase.statut_avancement.replace('_', ' ')}
                    </span>
                    {phase.nb_modifications > 0 && (
                      <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                        <RefreshCcw size={10} /> {phase.nb_modifications} RELANCES
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black uppercase italic mb-2">{phase.nom}</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">{phase.description || "Aucun détail technique fourni."}</p>
                  
                  <div className="flex flex-wrap gap-8">
                    {/* ZONE EXPERT AVEC RÉASSIGNATION */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#00AEEF] transition-colors"><User size={18}/></div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-gray-400">Expert Responsable</p>
                        {editingExpertId === phase.id ? (
                          <div className="flex items-center gap-2">
                            <select 
                              className="text-xs font-black uppercase bg-gray-50 border-2 border-[#00AEEF] rounded-lg px-2 py-1 outline-none"
                              onChange={(e) => updateExpert(phase.id, e.target.value)}
                              onBlur={() => setEditingExpertId(null)}
                              autoFocus
                            >
                              <option value="">-- Changer --</option>
                              {experts.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                            </select>
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            {phase.profils?.nom || 'NON ASSIGNÉ'}
                            {phase.statut_avancement === 'en_attente' && (
                              <button onClick={() => setEditingExpertId(phase.id)} className="text-[#00AEEF] hover:text-black transition-colors"><Edit3 size={12}/></button>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><DollarSign size={18}/></div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-gray-400">Honoraires</p>
                        <p className="text-xs font-bold text-gray-900">{phase.montant_expert?.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LOGIQUE BOUTONS DIRECTION */}
                <div className="lg:w-72 flex flex-col gap-3 justify-center border-l-0 lg:border-l-2 border-gray-50 lg:pl-8">
                  
                  {phase.statut_avancement === 'en_attente' && (
                    <button onClick={() => deletePhase(phase.id)} className="w-full py-4 border-2 border-red-100 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <Trash2 size={14} /> Supprimer la phase
                    </button>
                  )}

                  {phase.statut_avancement === 'en_cours' && (
                    <>
                      <button 
                        onClick={() => router.push(`/projets/${id}/activites/${activiteId}/photos/${phase.id}`)}
                        className="w-full py-4 bg-blue-50 text-[#00AEEF] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-transparent hover:border-[#00AEEF] transition-all"
                      >
                        <ImageIcon size={14} /> Voir Preuves ({phase.photos_expert?.length || 0})
                      </button>
                      <button 
                        onClick={() => handleUpdateStatut(phase, 'termine')}
                        className="w-full py-4 bg-[#7DB95C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
                      >
                        <CheckCircle2 size={16} /> Valider le travail
                      </button>
                    </>
                  )}

                  {phase.statut_avancement === 'termine' && (
                    <button 
                      onClick={() => handleUpdateStatut(phase, 'en_attente')}
                      className="w-full py-4 border-2 border-orange-200 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
                    >
                      <AlertCircle size={14} /> Refuser & Relancer
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}