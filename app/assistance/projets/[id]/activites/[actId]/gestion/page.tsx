"use client";
import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, CheckCircle2, RotateCcw, 
  ExternalLink, User, Clock, AlertCircle, 
  ShieldCheck, Loader2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GestionPhasesAssistance({ params }: { params: Promise<{ id: string, actId: string }> }) {
  const { id, actId } = use(params);
  const router = useRouter();
  
  const [phases, setPhases] = useState<any[]>([]);
  const [activite, setActivite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPhases();
  }, [actId]);

  async function fetchPhases() {
    const { data: act } = await supabase.from('activites').select('nom').eq('id', actId).single();
    const { data: ph } = await supabase.from('phases').select('*, profils(nom, telephone)').eq('activite_id', actId).order('created_at', { ascending: true });
    
    if (act) setActivite(act);
    if (ph) setPhases(ph);
    setLoading(false);
  }

  // Action : VALIDER LA PHASE
  const validerPhase = async (phaseId: string) => {
    setActionLoading(phaseId);
    const { error } = await supabase
      .from('phases')
      .update({ statut_avancement: 'termine' })
      .eq('id', phaseId);

    if (!error) fetchPhases();
    setActionLoading(null);
  };

  // Action : RELANCER (Remettre en cours / Attente)
  const relancerPhase = async (phaseId: string) => {
    setActionLoading(phaseId);
    // On peut aussi vider la preuve_url si on veut forcer l'expert à en uploader une nouvelle
    const { error } = await supabase
      .from('phases')
      .update({ statut_avancement: 'en_cours', preuve_url: null }) 
      .eq('id', phaseId);

    if (!error) {
      alert("Phase renvoyée à l'expert. La preuve précédente a été invalidée.");
      fetchPhases();
    }
    setActionLoading(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#00AEEF]" /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'assistance', nom: 'Service Assistance' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <Link href={`/assistance/projets/${id}`} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-black transition-colors w-fit">
          <ArrowLeft size={16} /> Retour au projet
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
            Contrôle des <span className="text-[#00AEEF]">Phases</span>
          </h1>
          <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">
            Étape : <span className="text-black">{activite?.nom}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {phases.map((ph) => (
            <div key={ph.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all flex flex-col md:flex-row justify-between items-center gap-8 ${ph.statut_avancement === 'termine' ? 'border-[#7DB95C]/20' : 'border-gray-100 shadow-sm'}`}>
              
              {/* INFOS PHASE */}
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  ph.statut_avancement === 'termine' ? 'bg-[#7DB95C] text-white' : 'bg-gray-900 text-white'
                }`}>
                  {ph.statut_avancement === 'termine' ? <ShieldCheck size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic leading-none mb-2">{ph.nom}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><User size={12}/> {ph.profils?.nom}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={ph.statut_avancement === 'termine' ? 'text-[#7DB95C]' : 'text-orange-500'}>
                      {ph.statut_avancement.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS & PREUVES */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {ph.preuve_url ? (
                  <a 
                    href={ph.preuve_url} 
                    target="_blank" 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-blue-50 text-[#00AEEF] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00AEEF] hover:text-white transition-all border-2 border-transparent hover:border-[#00AEEF]"
                  >
                    <ExternalLink size={16} /> Voir le Livrable
                  </a>
                ) : (
                  <div className="flex-1 md:flex-none flex items-center gap-2 px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase italic border-2 border-dashed border-gray-200">
                    <AlertCircle size={16} /> Aucune preuve
                  </div>
                )}

                {/* BOUTONS DE VALIDATION (Uniquement si terminé ou en cours) */}
                <div className="flex gap-2 w-full md:w-auto">
                   {ph.statut_avancement !== 'termine' && (
                     <button 
                       onClick={() => validerPhase(ph.id)}
                       disabled={actionLoading === ph.id}
                       className="flex-1 md:flex-none bg-[#7DB95C] text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg active:scale-95 transition-all flex items-center justify-center"
                     >
                       {actionLoading === ph.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16} className="mr-2"/>}
                       Valider
                     </button>
                   )}

                   {ph.statut_avancement === 'termine' && (
                     <button 
                       onClick={() => relancerPhase(ph.id)}
                       disabled={actionLoading === ph.id}
                       className="flex-1 md:flex-none bg-orange-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg active:scale-95 transition-all flex items-center justify-center"
                     >
                        <RotateCcw size={16} className="mr-2"/> Relancer
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