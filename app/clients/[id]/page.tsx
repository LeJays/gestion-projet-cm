"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, Briefcase, Landmark, Clock, 
  CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Mail, Phone, PlusCircle, X
} from 'lucide-react';

export default function EtatClientDirection() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la gestion du paiement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState<any>(null);
  const [nouveauVersement, setNouveauVersement] = useState("");

  useEffect(() => {
    fetchClientEtat();
  }, [id]);

  const fetchClientEtat = async () => {
    setLoading(true);
    const { data: clt } = await supabase.from('clients').select('*').eq('id', id).single();
    setClient(clt);

    const { data: projs } = await supabase.from('projets').select('*').eq('client_id', id);
    setProjets(projs || []);
    setLoading(false);
  };

  // --- LOGIQUE DE PAIEMENT ---
  const handlePayment = async () => {
    if (!selectedProjet || !nouveauVersement) return;

    const montantVerse = Number(nouveauVersement);
    const nouveauCumul = (Number(selectedProjet.montant_paye) || 0) + montantVerse;
    const totalDu = Number(selectedProjet.montant_total);

    // Déterminer le nouveau statut de paiement automatiquement
    let nouveauStatut = selectedProjet.statut_paiement;
    if (nouveauCumul >= totalDu) nouveauStatut = 'paye';
    else if (nouveauCumul > 0) nouveauStatut = 'prepaye';

    const { error } = await supabase
      .from('projets')
      .update({ 
        montant_paye: nouveauCumul,
        statut_paiement: nouveauStatut
      })
      .eq('id', selectedProjet.id);

    if (!error) {
      setIsModalOpen(false);
      setNouveauVersement("");
      fetchClientEtat();
    } else {
      alert("Erreur lors de l'encaissement : " + error.message);
    }
  };

  // --- CALCULS FINANCIERS ---
  const caTotal = projets.reduce((acc, p) => acc + (Number(p.montant_total) || 0), 0);
  const totalDejaPaye = projets.reduce((acc, p) => acc + (Number(p.montant_paye) || 0), 0);
  const resteAEncaisser = caTotal - totalDejaPaye;
  const tauxEncaissement = caTotal > 0 ? Math.round((totalDejaPaye / caTotal) * 100) : 0;
  
  // Dette opérationnelle : Projets payés mais non terminés
  const detteOperationnelle = projets
    .filter(p => p.statut_global !== 'termine')
    .reduce((acc, p) => acc + (Number(p.montant_paye) || 0), 0);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] animate-pulse text-2xl italic uppercase">Analyse Finance NSIK...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#00AEEF] mb-6 transition-all">
          <ArrowLeft size={14} /> Retour à l'annuaire
        </button>

        {/* HEADER FINANCIER */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border-2 border-gray-100 flex flex-col justify-center">
            <span className="bg-[#7DB95C] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mb-4">Fiche Client</span>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">{client?.nom}</h1>
            <div className="flex gap-4 mt-4 text-[10px] font-bold text-gray-400 uppercase italic">
              <span>{client?.mail}</span> • <span>{client?.numero}</span>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[3rem] text-white">
            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Encaissé</p>
            <p className="text-2xl font-black">{totalDejaPaye.toLocaleString()} <span className="text-xs">FCFA</span></p>
            <p className="text-[8px] text-[#7DB95C] font-bold mt-1 uppercase">Argent en caisse</p>
          </div>

          <div className="bg-red-50 p-8 rounded-[3rem] border-2 border-red-100">
            <p className="text-[9px] font-black text-red-400 uppercase mb-1">Dette Opérationnelle</p>
            <p className="text-2xl font-black text-red-600">-{detteOperationnelle.toLocaleString()} <span className="text-xs uppercase">XAF</span></p>
            <p className="text-[8px] font-bold text-red-300 mt-2 uppercase italic">Travaux à livrer</p>
          </div>
        </div>

        {/* BARRE DE SUIVI DYNAMIQUE */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#00AEEF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><Landmark size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1 tracking-widest">Évolution des paiements</p>
              <p className="text-lg font-black">{tauxEncaissement}% Recouvré</p>
            </div>
          </div>
          <div className="flex-1 w-full max-w-xl h-3 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-[#7DB95C] transition-all duration-1000" style={{ width: `${tauxEncaissement}%` }} />
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-orange-500 uppercase italic">Reste à percevoir</p>
             <p className="text-xl font-black text-gray-900">{resteAEncaisser.toLocaleString()} FCFA</p>
          </div>
        </div>

        {/* LISTE DES PROJETS AVEC ACTION D'ENCAISSEMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projets.map((p) => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-sm hover:border-[#00AEEF] transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="px-4 py-1 rounded-full text-[9px] font-black uppercase bg-gray-100 text-gray-500">
                  {p.statut_paiement}
                </div>
                <button 
                  onClick={() => { setSelectedProjet(p); setIsModalOpen(true); }}
                  className="bg-[#00AEEF] text-white p-2 rounded-xl hover:bg-black transition-colors"
                >
                  <PlusCircle size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-black uppercase italic mb-4">{p.nom}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Total Contrat</p>
                  <p className="text-xs font-black">{Number(p.montant_total).toLocaleString()} XAF</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl">
                  <p className="text-[8px] font-black text-[#7DB95C] uppercase">Déjà versé</p>
                  <p className="text-xs font-black text-[#7DB95C]">{Number(p.montant_paye || 0).toLocaleString()} XAF</p>
                </div>
              </div>

              <button 
                onClick={() => router.push(`/projets/${p.id}`)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00AEEF] transition-all"
              >
                Gérer le chantier
              </button>
            </div>
          ))}
        </div>

        {/* MODALE D'ENCAISSEMENT */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black"><X size={24}/></button>
              
              <h2 className="text-2xl font-black uppercase italic mb-2">Nouvel Encaissement</h2>
              <p className="text-sm text-gray-400 font-bold mb-8 uppercase italic">{selectedProjet?.nom}</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Montant à verser (FCFA)</label>
                  <input 
                    type="number"
                    value={nouveauVersement}
                    onChange={(e) => setNouveauVersement(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-xl font-black outline-none focus:border-[#00AEEF] transition-all"
                    placeholder="Ex: 500000"
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl">
                   <p className="text-[9px] font-black text-[#00AEEF] uppercase mb-1">Reste à payer après versement</p>
                   <p className="text-lg font-black text-[#00AEEF]">
                     {(Number(selectedProjet?.montant_total) - (Number(selectedProjet?.montant_paye || 0) + Number(nouveauVersement))).toLocaleString()} FCFA
                   </p>
                </div>

                <button 
                  onClick={handlePayment}
                  className="w-full py-5 bg-[#7DB95C] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirmer l'encaissement
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}