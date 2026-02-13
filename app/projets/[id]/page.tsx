"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { Layers, Plus, Calendar, ArrowLeft, Clock, Target, Loader2, X, DollarSign, User, PlusCircle } from 'lucide-react';

export default function DetailProjetNSIK() {
  const { id } = useParams();
  const router = useRouter();
  const [projet, setProjet] = useState<any>(null);
  const [activites, setActivites] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showActModal, setShowActModal] = useState(false);
  const [selectedActId, setSelectedActId] = useState<string | null>(null);
  const [submittingPhase, setSubmittingPhase] = useState(false);
  const [submittingAct, setSubmittingAct] = useState(false);

  const [actName, setActName] = useState('');
  const [phaseForm, setPhaseForm] = useState({
    nom: '',
    description: '',
    delai: '',
    montant_reel: '',
    montant_expert: '',
    expert_id: '',
    statut_paiement: 'paye',
    statut_avancement: 'en_attente'
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: proj } = await supabase.from('projets').select('*').eq('id', id).single();
    if (proj) setProjet(proj);

    const { data: exps } = await supabase.from('profils').select('id, nom, titre').neq('role', 'direction');
    if (exps) setExperts(exps);

    const { data: acts } = await supabase.from('activites').select(`*, phases (*)`).eq('projet_id', id);
    if (acts) {
      const processed = acts.map(act => {
        const total = act.phases?.length || 0;
        const done = act.phases?.filter((p: any) => p.statut_avancement === 'termine').length || 0;
        return { ...act, totalPhases: total, prog: total > 0 ? Math.round((done / total) * 100) : 0 };
      });
      setActivites(processed);
    }
    setLoading(false);
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAct(true);
    const { error } = await supabase.from('activites').insert([{
      nom: actName,
      projet_id: id,
      delai_direction: new Date().toISOString()
    }]);

    if (!error) {
      setActName('');
      setShowActModal(false);
      fetchData();
    } else {
      alert("Erreur Activité: " + error.message);
    }
    setSubmittingAct(false);
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // LOGIQUE DE CALCUL DU BUDGET RESTANT DE L'ACTIVITÉ
    const actParente = activites.find(a => a.id === selectedActId);
    const montantSaisi = parseFloat(phaseForm.montant_reel) || 0;
    const cumulPhasesExistantes = actParente?.phases?.reduce((acc: number, curr: any) => acc + (Number(curr.montant_reel) || 0), 0) || 0;
    const resteDisponible = (actParente?.montant || 0) - cumulPhasesExistantes;

    if (montantSaisi > resteDisponible) {
      alert(`BUDGET INSUFFISANT : L'activité "${actParente?.nom}" n'a plus que ${resteDisponible.toLocaleString()} FCFA de disponible.`);
      return;
    }

    setSubmittingPhase(true);
    const { error } = await supabase.from('phases').insert([{
      activite_id: selectedActId,
      nom: phaseForm.nom,
      description: phaseForm.description,
      delai: phaseForm.delai,
      montant_reel: montantSaisi,
      montant_expert: parseFloat(phaseForm.montant_expert) || 0,
      expert_id: phaseForm.expert_id || null,
      statut_paiement: actParente?.statut || 'prepaye', // Héritage direct de l'activité
      statut_avancement: 'en_attente',
      nb_modifications: 0
    }]);

    if (!error) {
      setShowPhaseModal(false);
      setPhaseForm({ nom: '', description: '', delai: '', montant_reel: '', montant_expert: '', expert_id: '', statut_paiement: 'paye', statut_avancement: 'en_attente' });
      fetchData();
    } else {
      alert("Erreur Phase: " + error.message);
    }
    setSubmittingPhase(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-[#00AEEF] bg-white text-2xl">CHARGEMENT NSIK...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        {/* HEADER HAUTE VISIBILITÉ */}
        <div className="mb-10 flex flex-col md:flex-row gap-8 items-center bg-white p-10 rounded-[3rem] border-2 border-gray-200 shadow-xl">
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="absolute w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="#E5E7EB" strokeWidth="12" fill="transparent" />
                <circle cx="64" cy="64" r="58" stroke="#7DB95C" strokeWidth="12" fill="transparent" 
                  strokeDasharray={364} strokeDashoffset={364 - (364 * (activites.length > 0 ? Math.round(activites.reduce((acc, curr) => acc + curr.prog, 0) / activites.length) : 0)) / 100} strokeLinecap="round" />
             </svg>
             <span className="text-3xl font-black text-gray-900">{activites.length > 0 ? Math.round(activites.reduce((acc, curr) => acc + curr.prog, 0) / activites.length) : 0}%</span>
          </div>
          <div className="flex-1">
            <button onClick={() => router.back()} className="text-sm font-black uppercase text-[#00AEEF] flex items-center gap-2 mb-3">
              <ArrowLeft size={18}/> RETOUR AUX PROJETS
            </button>
            <h1 className="text-5xl font-black uppercase text-gray-900 tracking-tighter">{projet?.nom}</h1>
            <p className="text-gray-600 font-bold text-sm uppercase tracking-widest mt-2 underline decoration-[#7DB95C] decoration-4">Localisation : {projet?.localisation}</p>
          </div>
          
          <button 
                onClick={() => router.push(`/projets/${id}/nouvelle-activite`)} 
                className="bg-black text-white px-8 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-[#00AEEF] transition-all shadow-2xl"
            >
                <PlusCircle size={24} /> NOUVELLE ACTIVITÉ
            </button>
        </div>

        {/* ACTIVITÉS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {activites.map((act) => (
            <div key={act.id} className="bg-white p-8 rounded-[3rem] border-2 border-gray-200 shadow-md hover:border-[#00AEEF] transition-all flex flex-col justify-between aspect-square">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                    <Layers size={30} />
                  </div>
                  <button onClick={() => { setSelectedActId(act.id); setShowPhaseModal(true); }} className="bg-[#00AEEF] text-white p-4 rounded-2xl shadow-lg hover:bg-black transition-colors">
                    <Plus size={24} />
                  </button>
                </div>
                <h3 className="text-3xl font-black uppercase text-gray-900 leading-none mb-3">{act.nom}</h3>
                <p className="text-sm font-black text-[#7DB95C] uppercase">{act.totalPhases} PHASES DÉFINIES</p>

                <div className="mt-8">
                  <div className="flex justify-between text-xs font-black uppercase mb-2">
                    <span className="text-gray-900">AVANCEMENT</span>
                    <span className="text-[#7DB95C]">{act.prog}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full border border-gray-200 overflow-hidden">
                    <div className="h-full bg-[#7DB95C]" style={{ width: `${act.prog}%` }}></div>
                  </div>
                </div>
              </div>
              <button onClick={() => router.push(`/projets/${id}/activites/${act.id}`)} className="w-full py-5 mt-6 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#00AEEF] transition-colors">
                GÉRER LES PHASES
              </button>
            </div>
          ))}
        </div>

        {/* MODAL PHASE */}
        {showPhaseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative border-4 border-[#00AEEF]">
              <button onClick={() => setShowPhaseModal(false)} className="absolute top-8 right-8 text-gray-900 hover:text-red-500"><X size={32}/></button>
              
              <h2 className="text-4xl font-black uppercase text-gray-900 mb-2 tracking-tighter">Nouvelle Phase</h2>
              <p className="text-[10px] font-black text-[#00AEEF] uppercase mb-10 tracking-widest">
                Activité : {activites.find(a => a.id === selectedActId)?.nom}
              </p>

              <form onSubmit={handleCreatePhase} className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase text-gray-900 mb-2">Nom de la phase</label>
                  <input required type="text" className="w-full p-5 bg-gray-100 rounded-xl font-bold text-gray-900 border-2 border-gray-300 focus:border-[#00AEEF] outline-none shadow-inner" value={phaseForm.nom} onChange={e => setPhaseForm({...phaseForm, nom: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase text-gray-900 mb-2">Description</label>
                  <textarea className="w-full p-5 bg-gray-100 rounded-xl font-bold text-gray-900 border-2 border-gray-300 focus:border-[#00AEEF] outline-none shadow-inner" rows={2} value={phaseForm.description} onChange={e => setPhaseForm({...phaseForm, description: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-2">Échéance (Max Activité)</label>
                  <input 
                    required 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    max={activites.find(a => a.id === selectedActId)?.delai_direction}
                    className="w-full p-5 bg-gray-100 rounded-xl font-bold text-gray-900 border-2 border-gray-300 outline-none focus:border-black shadow-inner" 
                    value={phaseForm.delai} 
                    onChange={e => setPhaseForm({...phaseForm, delai: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-2">Expert Responsable</label>
                  <select required className="w-full p-5 bg-gray-100 rounded-xl font-black text-gray-900 border-2 border-gray-300 shadow-inner" value={phaseForm.expert_id} onChange={e => setPhaseForm({...phaseForm, expert_id: e.target.value})}>
                    <option value="">Choisir...</option>
                    {experts.map(exp => <option key={exp.id} value={exp.id}>{exp.nom.toUpperCase()}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#7DB95C] mb-2">Budget Phase (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    placeholder={`Max: ${(activites.find(a => a.id === selectedActId)?.montant - (activites.find(a => a.id === selectedActId)?.phases?.reduce((acc:any, c:any) => acc + (Number(c.montant_reel)||0), 0))).toLocaleString()}`}
                    className="w-full p-5 bg-gray-100 rounded-xl font-bold text-gray-900 border-2 border-[#7DB95C] shadow-inner" 
                    value={phaseForm.montant_reel} 
                    onChange={e => setPhaseForm({...phaseForm, montant_reel: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-orange-600 mb-2">Part Expert (FCFA)</label>
                  <input type="number" className="w-full p-5 bg-gray-100 rounded-xl font-bold text-gray-900 border-2 border-orange-300 shadow-inner" value={phaseForm.montant_expert} onChange={e => setPhaseForm({...phaseForm, montant_expert: e.target.value})} />
                </div>

                <button type="submit" disabled={submittingPhase} className="col-span-2 py-6 bg-gray-900 text-white rounded-2xl font-black uppercase text-lg tracking-widest hover:bg-[#00AEEF] transition-all shadow-xl mt-4 active:scale-95">
                  {submittingPhase ? <Loader2 className="animate-spin mx-auto" /> : "VALIDER ET DÉDUIRE DU BUDGET"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}