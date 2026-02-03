"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { UserPlus, Phone, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NouveauClient() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Synchronisé avec tes colonnes SQL : nom, numero, mail
  const [formData, setFormData] = useState({
    nom: '',
    numero: '',
    mail: '',
    mode_prefere: 'cash'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Envoi direct vers ta table avec les bons noms de colonnes
    const { error } = await supabase.from('clients').insert([formData]);

    if (error) {
      alert("Erreur base de données : " + error.message);
    } else {
      alert("Client enregistré chez NSIK'ARCHI !");
      router.push('/clients');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userProfile={{role: 'direction', nom: 'James'}} />
      
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/clients" className="flex items-center gap-2 text-gray-500 hover:text-[#00AEEF] mb-8 font-bold group">
            <ArrowLeft size={18} /> Retour
          </Link>

          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-8">
            Nouveau Client
          </h1>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
            
            {/* NOM */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Nom du client</label>
              <div className="relative mt-2">
                <UserPlus className="absolute left-5 top-4 text-[#00AEEF]" size={20} />
                <input 
                  type="text" required 
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-semibold border-2 border-transparent focus:border-[#00AEEF]"
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NUMERO */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Numéro de téléphone</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-5 top-4 text-[#00AEEF]" size={20} />
                  <input 
                    type="tel" required 
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-semibold border-2 border-transparent focus:border-[#00AEEF]"
                    onChange={(e) => setFormData({...formData, numero: e.target.value})} 
                  />
                </div>
              </div>

              {/* MAIL */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Adresse Mail</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-5 top-4 text-[#00AEEF]" size={20} />
                  <input 
                    type="email" 
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-semibold border-2 border-transparent focus:border-[#00AEEF]"
                    onChange={(e) => setFormData({...formData, mail: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* MODE PREFERE */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mode de paiement préféré</label>
              <select 
                className="w-full mt-2 p-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-bold border-2 border-transparent focus:border-[#7DB95C]"
                onChange={(e) => setFormData({...formData, mode_prefere: e.target.value})}
              >
                <option value="cash">Cash (Espèces)</option>
                <option value="bancaire">Virement</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="orange_money">Orange Money</option>
              </select>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-[#7DB95C] text-white py-5 rounded-2xl font-black text-lg transition shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? "TRAITEMENT..." : <><CheckCircle2 size={24} /> ENREGISTRER CLIENT</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}