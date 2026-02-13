"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Calendar, MapPin, Plus, LayoutGrid, AlertTriangle, 
  Clock, ArrowRight, Zap, BellRing, CheckCircle2, PlayCircle, Coffee, Trash2, Loader2, Banknote, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

export default function ListeProjetsNSIK() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // États pour la gestion des dépenses
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({ montant: '', motif: '' });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  useEffect(() => {
    fetchProjets();
  }, []);

  async function fetchProjets() {
    setLoading(true);
    const { data } = await supabase
      .from('projets')
      .select(`
        *,
        activites (
          id,
          phases (id, expert_id)
        )
      `);

    if (data) {
      const aujourdhui = new Date();
      const projetsTraites = data.map(p => {
        let statutFinal = p.statut_projet || 'en_attente'; 
        if (p.statut_projet !== 'termine') {
          const aDesExperts = p.activites?.some((act: any) => 
            act.phases?.some((ph: any) => ph.expert_id !== null)
          );
          statutFinal = aDesExperts ? 'en_cours' : 'en_attente';
        }
        return { ...p, statut_affichage: statutFinal };
      });

      const trie = projetsTraites.sort((a, b) => {
        if (a.statut_affichage === 'termine' && b.statut_affichage !== 'termine') return 1;
        if (a.statut_affichage !== 'termine' && b.statut_affichage === 'termine') return -1;
        if (a.priorite_urgente && !b.priorite_urgente) return -1;
        if (!a.priorite_urgente && b.priorite_urgente) return 1;
        const diffA = new Date(a.delai_livraison).getTime();
        const diffB = new Date(b.delai_livraison).getTime();
        return diffA - diffB;
      });

      setProjets(trie);
      analyserAlertes(trie);
    }
    setLoading(false);
  }

  const analyserAlertes = (listeProjets: any[]) => {
    const aujourdhui = new Date();
    const actifs = listeProjets.filter(p => p.statut_affichage !== 'termine');
    const depasses = actifs.filter(p => new Date(p.delai_livraison) < aujourdhui);
    const proches = actifs.filter(p => {
      const diffJours = Math.ceil((new Date(p.delai_livraison).getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));
      return diffJours >= 0 && diffJours <= 7;
    });

    if (depasses.length > 0) {
      toast.error(`DÉLAI DÉPASSÉ : ${depasses.length} projet(s)`, { duration: 5000 });
    }
    if (proches.length > 0) {
      toast.warning(`ÉCHÉANCE PROCHE : ${proches.length} projet(s)`, { duration: 4000 });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingExpense(true);
    
    const { error } = await supabase.from('depenses_projets').insert([{
      projet_id: selectedProjet.id,
      montant: parseFloat(expenseForm.montant),
      motif: expenseForm.motif,
      date_depense: new Date().toISOString()
    }]);

    if (!error) {
      toast.success("Dépense enregistrée avec succès");
      setShowExpenseModal(false);
      setExpenseForm({ montant: '', motif: '' });
    } else {
      toast.error("Erreur : " + error.message);
    }
    setSubmittingExpense(false);
  };

  const toggleUrgence = async (e: React.MouseEvent, projet: any) => {
    e.stopPropagation();
    const deviensUrgent = !projet.priorite_urgente;
    let nouvelleDate = projet.delai_livraison;

    if (deviensUrgent) {
      const saisie = window.prompt(
        `PROJET URGENT : Souhaitez-vous modifier la date de livraison ? (Format: AAAA-MM-JJ)`, 
        projet.delai_livraison
      );
      if (saisie !== null && saisie !== "") {
        nouvelleDate = saisie;
      }
    }

    const { error } = await supabase
      .from('projets')
      .update({ 
        priorite_urgente: deviensUrgent,
        delai_livraison: nouvelleDate 
      })
      .eq('id', projet.id);

    if (!error) {
      toast.success(deviensUrgent ? "Projet prioritaire mis à jour" : "Urgence retirée");
      fetchProjets();
    }
  };

  const supprimerProjetTotal = async (e: React.MouseEvent, projetId: string, nomProjet: string) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer définitivement "${nomProjet.toUpperCase()}" ?`)) {
      try {
        setIsDeleting(true);
        const { data: acts } = await supabase.from('activites').select('id').eq('projet_id', projetId);
        if (acts && acts.length > 0) {
          const actIds = acts.map(a => a.id);
          await supabase.from('phases').delete().in('activite_id', actIds);
          await supabase.from('activites').delete().eq('projet_id', projetId);
        }
        await supabase.from('projets').delete().eq('id', projetId);
        toast.success("Dossier supprimé");
        fetchProjets();
      } catch (err) { toast.error("Erreur de suppression"); }
      finally { setIsDeleting(false); }
    }
  };

  const deciderTerminer = async (e: React.MouseEvent, projet: any) => {
    e.stopPropagation();
    const nouveauStatut = projet.statut_projet === 'termine' ? 'en_attente' : 'termine';
    await supabase.from('projets').update({ statut_projet: nouveauStatut }).eq('id', projet.id);
    fetchProjets();
  };

  const getStatutStyle = (p: any) => {
    if (p.statut_affichage === 'termine') return { color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200', label: 'TERMINÉ', icon: <CheckCircle2 size={28}/> };
    if (p.priorite_urgente) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'URGENCE DIRECTION', icon: <Zap size={28} fill="currentColor"/> };
    const diffJours = Math.ceil((new Date(p.delai_livraison).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffJours < 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'RETARD CRITIQUE', icon: <AlertTriangle size={28}/> };
    if (p.statut_affichage === 'en_cours') return { color: 'text-[#00AEEF]', bg: 'bg-blue-50', border: 'border-blue-100', label: 'PRODUCTION', icon: <PlayCircle size={28}/> };
    return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'EN ATTENTE', icon: <Coffee size={28}/> };
  };

  if (loading && !isDeleting) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] bg-white text-2xl animate-pulse italic uppercase tracking-widest text-center p-10">Analyse du portefeuille NSIK...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" richColors closeButton />
      <Sidebar userProfile={{role: 'direction', nom: 'James'}} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Projets <span className="text-[#00AEEF]">NSIK</span></h1>
            <p className="text-gray-400 font-bold text-[10px] mt-3 tracking-[0.3em] uppercase italic flex items-center gap-2">
              <BellRing size={14} className="text-orange-500" /> Dashboard Direction
            </p>
          </div>
          <button onClick={() => router.push('/projets/nouveau')} className="w-20 h-20 bg-black text-white rounded-[2.2rem] flex flex-col items-center justify-center hover:bg-[#00AEEF] transition-all shadow-xl active:scale-90 group">
            <Plus size={30} className="group-hover:rotate-90 transition-transform" />
            <span className="text-[9px] font-black mt-1 uppercase">Créer</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projets.map((p) => {
            const style = getStatutStyle(p);
            const estDepasse = new Date(p.delai_livraison) < new Date() && p.statut_affichage !== 'termine';
            
            return (
              <div key={p.id} onClick={() => router.push(`/projets/${p.id}`)}
                className={`group relative bg-white p-8 rounded-[3.5rem] shadow-sm border-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[420px]
                  ${p.statut_affichage === 'termine' ? 'opacity-50' : 
                    p.priorite_urgente ? 'border-orange-400 shadow-2xl shadow-orange-50' : 
                    (estDepasse ? 'border-red-500 bg-red-50/10' : 'border-white hover:border-[#00AEEF] hover:shadow-xl hover:-translate-y-2')}`}
              >
                <div className="absolute top-8 right-8 flex flex-wrap justify-end gap-2 z-10 max-w-[160px]">
                  {/* BOUTON DÉPENSE */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProjet(p);
                      setShowExpenseModal(true);
                    }}
                    className="p-3 rounded-2xl border-2 bg-white text-gray-200 border-gray-50 hover:text-[#7DB95C] hover:border-[#7DB95C] transition-all active:scale-75 shadow-sm"
                  >
                    <Banknote size={20} />
                  </button>
                  
                  <button onClick={(e) => supprimerProjetTotal(e, p.id, p.nom)} className="p-3 rounded-2xl border-2 bg-white text-gray-200 border-gray-50 hover:text-red-600 transition-all active:scale-75 shadow-sm"><Trash2 size={20} /></button>
                  
                  <button onClick={(e) => deciderTerminer(e, p)} className={`p-3 rounded-2xl border-2 transition-all active:scale-75 ${p.statut_affichage === 'termine' ? 'bg-green-600 border-green-600 text-white' : 'bg-white text-gray-200 border-gray-50 hover:text-green-600'}`}><CheckCircle2 size={20} /></button>
                  
                  {p.statut_affichage !== 'termine' && (
                    <button onClick={(e) => toggleUrgence(e, p)} className={`p-3 rounded-2xl border-2 transition-all active:scale-75 ${p.priorite_urgente ? 'bg-orange-500 border-orange-500 text-white animate-pulse' : 'bg-white text-gray-200 border-gray-50 hover:text-orange-500'}`}><Zap size={20} fill={p.priorite_urgente ? "currentColor" : "none"} /></button>
                  )}
                </div>
                
                <div>
                  <div className={`w-20 h-20 ${style.bg} ${style.color} rounded-[2rem] flex items-center justify-center border-2 ${style.border} mb-8 transition-all duration-500 group-hover:rotate-6`}>{style.icon}</div>
                  <div className="space-y-3">
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${style.color}`}>{style.label}</span>
                    <h3 className={`text-3xl font-black text-gray-900 uppercase leading-[1.1] pr-12 group-hover:text-[#00AEEF] transition-colors ${p.statut_affichage === 'termine' ? 'line-through opacity-50' : ''}`}>{p.nom}</h3>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-4 text-gray-500 font-bold text-xs"><MapPin size={18} className="text-[#00AEEF]" /><span className="uppercase font-black">{p.localisation || 'Cameroun'}</span></div>
                  <div className="flex items-center gap-4 text-gray-500"><Calendar size={18} className="text-[#00AEEF]" />
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase italic">Échéance finale</p>
                      <p className={`font-black text-sm ${estDepasse ? 'text-red-600 underline' : 'text-gray-700'}`}>
                        {new Date(p.delai_livraison).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODALE DÉPENSE */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border-4 border-[#7DB95C]">
              <button onClick={() => setShowExpenseModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                <X size={24}/>
              </button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Sortie de Caisse</h2>
                <p className="text-[10px] font-bold text-[#7DB95C] uppercase tracking-widest">Projet : {selectedProjet?.nom}</p>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Montant (FCFA)</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full p-4 bg-gray-100 rounded-2xl font-black text-xl border-2 border-transparent focus:border-[#7DB95C] outline-none"
                    value={expenseForm.montant}
                    onChange={e => setExpenseForm({...expenseForm, montant: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Motif</label>
                  <textarea 
                    required
                    placeholder="Ex: Achat de matériel, Transport..."
                    className="w-full p-4 bg-gray-100 rounded-2xl font-bold border-2 border-transparent focus:border-[#7DB95C] outline-none"
                    value={expenseForm.motif}
                    onChange={e => setExpenseForm({...expenseForm, motif: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingExpense}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#7DB95C] transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {submittingExpense ? <Loader2 className="animate-spin" /> : <><Banknote size={20}/> Valider</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {isDeleting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
          <Loader2 size={60} className="animate-spin text-[#00AEEF] mb-4" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Nettoyage...</h2>
        </div>
      )}
    </div>
  );
}