"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  TrendingUp, Plus, DollarSign, Loader2, 
  Calendar, ArrowUpCircle, History, Landmark 
} from 'lucide-react';

export default function InvestissementsPage() {
  const [invests, setInvests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvest, setSelectedInvest] = useState<any>(null);
  
  const [formData, setFormData] = useState({ nom: '', montant: '' });
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    fetchInvestissements();
  }, []);

  async function fetchInvestissements() {
    const { data } = await supabase.from('investissements').select('*').order('created_at', { ascending: false });
    if (data) setInvests(data);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('investissements')
      .insert([{ nom: formData.nom, montant_total: Number(formData.montant) }]);
    
    if (!error) {
      setShowModal(false);
      setFormData({ nom: '', montant: '' });
      fetchInvestissements();
    }
  };

  const handleUpdateAmount = async (id: string, currentTotal: number) => {
    const nouveauTotal = currentTotal + Number(addAmount);
    const { error } = await supabase
      .from('investissements')
      .update({ montant_total: nouveauTotal })
      .eq('id', id);

    if (!error) {
      setAddAmount('');
      setSelectedInvest(null);
      fetchInvestissements();
      alert("Montant mis à jour avec succès !");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00AEEF]" /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Gestion <span className="text-[#7DB95C]">Investissements</span></h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Capital & Actifs de NSIK'ARCHI</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 hover:bg-[#7DB95C] transition-all shadow-xl">
            <Plus size={22} /> NOUVEL ACTIF
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {invests.map((inv) => (
            <div key={inv.id} className="bg-white p-10 rounded-[4rem] border-2 border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-[#7DB95C]">
                  <Landmark size={30} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valeur Actuelle</p>
                  <p className="text-3xl font-black text-gray-900">{inv.montant_total?.toLocaleString()} F</p>
                </div>
              </div>

              <h3 className="text-xl font-black uppercase mb-8 tracking-tight">{inv.nom}</h3>

              {/* Action: Ajouter un montant */}
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Montant à ajouter..." 
                  className="flex-1 bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#7DB95C] transition-all"
                  value={selectedInvest === inv.id ? addAmount : ''}
                  onChange={(e) => {
                    setSelectedInvest(inv.id);
                    setAddAmount(e.target.value);
                  }}
                />
                <button 
                  onClick={() => handleUpdateAmount(inv.id, inv.montant_total)}
                  className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-[#7DB95C] transition-all"
                >
                  <ArrowUpCircle size={24} />
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-4 text-gray-400 font-bold text-[9px] uppercase tracking-widest">
                <Calendar size={12} /> Créé le {new Date(inv.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL CRÉATION */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[4rem] p-12 shadow-2xl relative">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center">Nouvel <span className="text-[#7DB95C]">Investissement</span></h2>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nom de l'investissement</label>
                  <input type="text" required placeholder="Ex: Nouveau matériel Bureau" className="w-full p-5 bg-gray-50 rounded-[1.8rem] font-bold outline-none border-2 border-transparent focus:border-[#7DB95C]" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Montant Initial (F CFA)</label>
                  <input type="number" required placeholder="500 000" className="w-full p-5 bg-gray-50 rounded-[1.8rem] font-bold outline-none border-2 border-transparent focus:border-[#7DB95C]" value={formData.montant} onChange={e => setFormData({...formData, montant: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 font-black uppercase text-xs text-gray-400">Annuler</button>
                  <button type="submit" className="flex-1 py-5 bg-[#7DB95C] text-white rounded-[1.5rem] font-black uppercase text-xs shadow-lg">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}