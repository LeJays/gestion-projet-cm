"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  Image as ImageIcon, DollarSign, User, Trash2, Edit3, RefreshCcw, Clock, Gavel, Calendar
} from 'lucide-react';
export const runtime = 'edge';

export default function GestionPhasesDirection() {
  const { id, activiteId } = useParams();
  const router = useRouter();
  
  const [phases, setPhases] = useState<any[]>([]);
  const [activite, setActivite] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour l'édition groupée (Expert, Montant, Délai)
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    expert_id: '', 
    montant_expert: 0,
    delai: '' 
  });

  const today = new Date();

  const fetchExperts = async () => {
    // Correction de la récupération : on s'assure d'avoir ceux qui ne sont pas 'direction'
    const { data, error } = await supabase
      .from('profils')
      .select('id, nom')
      .neq('role', 'direction');
    
    if (data) setExperts(data);
    if (error) console.error("Erreur experts:", error.message);
  };

  const fetchPhasesData = async () => {
    setLoading(true);
    const { data: act } = await supabase.from('activites').select('nom, montant, projets(nom)').eq('id', activiteId).single();
    setActivite(act);

    const { data: phs } = await supabase
      .from('phases')
      .select(`*, profils:expert_id (nom, telephone)`)
      .eq('activite_id', activiteId)
      .order('delai', { ascending: true });

    if (phs) setPhases(phs);
    setLoading(false);
  };

  useEffect(() => {
    if (activiteId) {
      fetchPhasesData();
      fetchExperts();
    }
  }, [activiteId]);

  const handleUpdateStatut = async (phase: any, nouveauStatut: string) => {
    let updateData: any = { statut_avancement: nouveauStatut };
    if (phase.statut_avancement === 'termine' && nouveauStatut === 'en_attente') {
      updateData.nb_modifications = (phase.nb_modifications || 0) + 1;
    }
    const { error } = await supabase.from('phases').update(updateData).eq('id', phase.id);
    if (!error) fetchPhasesData();
  };

  const handleFullUpdate = async (phaseId: string) => {
    const { error } = await supabase.from('phases').update({ 
      expert_id: editForm.expert_id, 
      montant_expert: editForm.montant_expert,
      delai: editForm.delai
    }).eq('id', phaseId);
    
    if (!error) {
      setEditingPhaseId(null);
      fetchPhasesData();
    } else {
      alert("Erreur lors de la mise à jour : " + error.message);
    }
  };

  const deletePhase = async (phaseId: string) => {
    if(confirm("Confirmez-vous la suppression définitive ?")) {
      const { error } = await supabase.from('phases').delete().eq('id', phaseId);
      if (!error) fetchPhasesData();
    }
  };

  const getPhaseAlerts = (delaiStr: string, statut: string, montantExpert: number) => {
    if (statut === 'termine') return { label: 'Complété', color: 'text-green-500', penalty: 0 };
    
    const delai = new Date(delaiStr);
    const diffTime = delai.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const joursRetard = Math.abs(diffDays);
      const penalite = (montantExpert * 0.10) * joursRetard;
      return { 
        label: `RETARD : ${joursRetard} JOUR(S)`, 
        color: 'text-red-600 animate-pulse', 
        penalty: Math.min(penalite, montantExpert),
        isLate: true 
      };
    } else if (diffDays <= 2) {
      return { label: 'ÉCHÉANCE PROCHE', color: 'text-orange-500', penalty: 0 };
    }
    return { label: 'DANS LES DÉLAIS', color: 'text-gray-400', penalty: 0 };
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] bg-white text-2xl italic uppercase">Mise à jour NSIK...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <header className="mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#00AEEF] mb-4">
            <ArrowLeft size={14} /> Retour au projet
          </button>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#7DB95C] font-black text-xs uppercase tracking-[0.3em] mb-1">{activite?.projets?.nom}</p>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{activite?.nom}</h1>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {phases.map((phase) => {
            const alertInfo = getPhaseAlerts(phase.delai, phase.statut_avancement, phase.montant_expert);
            const isEditing = editingPhaseId === phase.id;

            return (
              <div key={phase.id} className={`bg-white rounded-[2.5rem] border-2 p-8 shadow-sm transition-all ${alertInfo.penalty > 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        phase.statut_avancement === 'termine' ? 'bg-green-100 text-green-600' : 
                        phase.statut_avancement === 'en_cours' ? 'bg-blue-100 text-[#00AEEF]' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {phase.statut_avancement.replace('_', ' ')}
                      </span>
                      <span className={`text-[8px] font-black uppercase flex items-center gap-1 ${alertInfo.color}`}>
                        <Clock size={10} /> {alertInfo.label}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black uppercase italic mb-2">{phase.nom}</h3>
                    
                    <div className="flex flex-wrap gap-6 mt-6 p-4 bg-gray-50 rounded-3xl">
                      {/* EXPERT */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <User size={18} className="text-[#00AEEF]"/>
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase text-gray-400">Expert</p>
                          {isEditing ? (
                            <select 
                              className="w-full text-[10px] font-bold border-b-2 border-[#00AEEF] bg-transparent outline-none"
                              value={editForm.expert_id}
                              onChange={(e) => setEditForm({...editForm, expert_id: e.target.value})}
                            >
                              <option value="">Sélectionner...</option>
                              {experts.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                            </select>
                          ) : (
                            <p className="text-xs font-bold">{phase.profils?.nom || 'NON ASSIGNÉ'}</p>
                          )}
                        </div>
                      </div>

                      {/* MONTANT */}
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <DollarSign size={18} className="text-[#7DB95C]"/>
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase text-gray-400">Part Expert</p>
                          {isEditing ? (
                            <input 
                              type="number"
                              className="w-full text-[10px] font-bold border-b-2 border-[#00AEEF] bg-transparent outline-none"
                              value={editForm.montant_expert}
                              onChange={(e) => setEditForm({...editForm, montant_expert: Number(e.target.value)})}
                            />
                          ) : (
                            <p className="text-xs font-bold">{(phase.montant_expert - alertInfo.penalty).toLocaleString()} FCFA</p>
                          )}
                        </div>
                      </div>

                      {/* NOUVEAU : DÉLAI */}
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <Calendar size={18} className="text-orange-500"/>
                        <div className="flex-1">
                          <p className="text-[8px] font-black uppercase text-gray-400">Échéance</p>
                          {isEditing ? (
                            <input 
                              type="date"
                              className="w-full text-[10px] font-bold border-b-2 border-[#00AEEF] bg-transparent outline-none"
                              value={editForm.delai}
                              onChange={(e) => setEditForm({...editForm, delai: e.target.value})}
                            />
                          ) : (
                            <p className="text-xs font-bold">{new Date(phase.delai).toLocaleDateString('fr-FR')}</p>
                          )}
                        </div>
                      </div>

                      {/* BOUTONS D'ÉDITION RAPIDE */}
                      <div className="flex items-center ml-auto">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleFullUpdate(phase.id)} className="bg-[#00AEEF] text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase">Sauvegarder</button>
                            <button onClick={() => setEditingPhaseId(null)} className="bg-gray-200 text-gray-500 px-4 py-2 rounded-xl text-[8px] font-black uppercase">Annuler</button>
                          </div>
                        ) : (
                          <button onClick={() => {
                            setEditingPhaseId(phase.id);
                            setEditForm({ 
                              expert_id: phase.expert_id || '', 
                              montant_expert: phase.montant_expert || 0,
                              delai: phase.delai || ''
                            });
                          }} className="p-2 hover:bg-[#00AEEF]/10 text-[#00AEEF] rounded-full transition-colors">
                            <Edit3 size={16}/>
                          </button>
                        )}
                      </div>
                    </div>

                    {alertInfo.penalty > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-2xl w-fit">
                        <Gavel size={14}/>
                        <p className="text-[10px] font-black uppercase italic">Pénalité déduite : {alertInfo.penalty.toLocaleString()} FCFA</p>
                      </div>
                    )}
                  </div>

                  {/* ACTIONS DIRECTION */}
                  <div className="lg:w-72 flex flex-col gap-3 justify-center border-l-0 lg:border-l-2 border-gray-100 lg:pl-8">
                    {(phase.statut_avancement === 'en_attente' || phase.statut_avancement === 'en_cours') && (
                      <button onClick={() => deletePhase(phase.id)} className="w-full py-4 border-2 border-red-50 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14} /> Supprimer
                      </button>
                    )}

                    {phase.statut_avancement === 'termine' ? (
                      <>
                        <button 
                          onClick={() => router.push(`/projets/${id}/activites/${activiteId}/photos/${phase.id}`)}
                          className="w-full py-4 bg-blue-50 text-[#00AEEF] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <ImageIcon size={14} /> Voir Preuves ({phase.photos_expert?.length || 0})
                        </button>
                        <button onClick={() => alert("Validé !")} className="w-full py-4 bg-[#7DB95C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                          <CheckCircle2 size={16} /> Valider
                        </button>
                        <button onClick={() => handleUpdateStatut(phase, 'en_attente')} className="w-full py-4 border-2 border-orange-200 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <RefreshCcw size={14} /> Refuser & Relancer
                        </button>
                      </>
                    ) : (
                      phase.statut_avancement === 'en_cours' && (
                        <button onClick={() => router.push(`/projets/${id}/activites/${activiteId}/photos/${phase.id}`)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic">
                          En cours de réalisation...
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
