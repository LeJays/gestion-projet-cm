"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, Loader2, CheckCircle2, UserPlus, Phone, Mail } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
export const runtime = 'edge';

export default function ModifierClient() {
  const { id } = useParams(); // Récupère l'ID dans l'URL
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Synchronisé avec ton SQL : nom, numero, mail, mode_prefere
  const [formData, setFormData] = useState({
    nom: '',
    numero: '',
    mail: '',
    mode_prefere: 'cash'
  });

  // Charger les infos du client au démarrage
  useEffect(() => {
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert("Erreur lors de la récupération du client");
        router.push('/clients');
      } else if (data) {
        setFormData({
          nom: data.nom,
          numero: data.numero,
          mail: data.mail,
          mode_prefere: data.mode_prefere
        });
      }
      setLoading(false);
    };
    fetchClient();
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('clients')
      .update(formData)
      .eq('id', id);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      alert("Fiche client NSIK'ARCHI mise à jour !");
      router.push('/clients');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#00AEEF]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/clients" className="flex items-center gap-2 text-gray-500 hover:text-[#00AEEF] mb-8 font-bold group">
            <ArrowLeft size={18} /> Retour à l'annuaire
          </Link>

          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
            Modifier Client
          </h1>
          <p className="text-[#00AEEF] font-bold text-sm mb-8 tracking-widest">ÉDITION DU PROFIL PARTENAIRE</p>

          <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
            
            {/* NOM */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom du client</label>
              <div className="relative mt-2">
                <UserPlus className="absolute left-5 top-4 text-[#00AEEF]" size={20} />
                <input 
                  type="text" required 
                  value={formData.nom}
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-semibold border-2 border-transparent focus:border-[#00AEEF] transition"
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NUMERO */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Numéro de téléphone</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-5 top-4 text-[#00AEEF]" size={20} />
                  <input 
                    type="tel" required 
                    value={formData.numero}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-semibold border-2 border-transparent focus:border-[#00AEEF] transition"
                    onChange={(e) => setFormData({...formData, numero: e.target.value})} 
                  />
                </div>
              </div>

              {/* MAIL */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Adresse Mail</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-5 top-4 text-[#00AEEF]" size={20} />
                  <input 
                    type="email" 
                    value={formData.mail || ''}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-semibold border-2 border-transparent focus:border-[#00AEEF] transition"
                    onChange={(e) => setFormData({...formData, mail: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* MODE PREFERE */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Mode de paiement préféré</label>
              <select 
                value={formData.mode_prefere}
                className="w-full mt-2 p-4 bg-gray-50 rounded-2xl outline-none text-gray-900 font-bold border-2 border-transparent focus:border-[#7DB95C] transition cursor-pointer"
                onChange={(e) => setFormData({...formData, mode_prefere: e.target.value})}
              >
                <option value="cash">Cash (Espèces)</option>
                <option value="bancaire">Virement</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="orange_money">Orange Money</option>
              </select>
            </div>

            <button 
              type="submit" disabled={saving}
              className="w-full bg-[#7DB95C] hover:bg-[#00AEEF] text-white py-5 rounded-2xl font-black text-lg transition shadow-lg flex items-center justify-center gap-3 transform active:scale-95"
            >
              {saving ? (
                "MISE À JOUR..."
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  ENREGISTRER LES MODIFICATIONS
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
