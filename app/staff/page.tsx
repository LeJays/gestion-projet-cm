"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { Plus, Users, ShieldCheck, HardHat, Loader2, X, Phone, Mail, Lock } from 'lucide-react';

export default function GestionStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // État aligné exactement sur ta table 'profils'
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'expert',
    titre: '',
    password: '' // Pour la future connexion
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const { data } = await supabase.from('profils').select('*').order('created_at', { ascending: false });
    if (data) setStaff(data);
    setLoading(false);
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // 1. Création de l'identifiant de connexion (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert("Erreur Auth : " + authError.message);
      setSubmitting(false);
      return;
    }

    // 2. Insertion de TOUTES les données dans la table 'profils'
    if (authData.user?.id) {
      const { error: profileError } = await supabase
        .from('profils')
        .insert([{
          id: authData.user.id, // Lien avec l'Auth
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          role: formData.role,
          titre: formData.titre
        }]);

      if (profileError) {
        alert("Erreur Profil : " + profileError.message);
      } else {
        alert("Membre enregistré avec succès ! Un email de vérification a été envoyé.");
        setShowModal(false);
        setFormData({ nom: '', email: '', telephone: '', role: 'expert', titre: '', password: '' });
        fetchStaff();
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Staff NSIK'ARCHI</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Contrôle des accès et annuaire</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-[#00AEEF] text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl">
            <Plus size={20} /> ENRÔLER UN MEMBRE
          </button>
        </header>

        {/* LISTE DES MEMBRES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${m.role === 'assistance' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#00AEEF]'}`}>
                {m.role === 'assistance' ? <ShieldCheck size={28} /> : <HardHat size={28} />}
              </div>
              <div>
                <h3 className="font-black uppercase text-sm">{m.nom}</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{m.titre || m.role}</p>
                <div className="flex gap-2 mt-2">
                   <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Phone size={10}/> {m.telephone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL COMPLET */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Nouveau Collaborateur</h2>
              
              <form onSubmit={handleAddStaff} className="grid grid-cols-2 gap-6">
                {/* NOM */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nom Complet</label>
                  <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00AEEF]" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                </div>

                {/* EMAIL ET TEL */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Email Professionnel</label>
                  <input type="email" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Téléphone</label>
                  <input type="tel" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                </div>

                {/* RÔLE ET TITRE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Rôle Utilisateur</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl font-black uppercase text-xs" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="expert">EXPERT</option>
                    <option value="assistance">ASSISTANCE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Titre / Spécialité</label>
                  <input type="text" placeholder="ex: Architecte" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} />
                </div>

                {/* MOT DE PASSE POUR PLUS TARD */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#7DB95C] ml-2 flex items-center gap-1"><Lock size={10}/> Mot de passe de connexion</label>
                  <input type="password" required placeholder="••••••••" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-[#7DB95C]/20" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>

                <div className="col-span-2 flex gap-4 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 font-black uppercase text-xs text-gray-400">Annuler</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-5 bg-[#00AEEF] text-white rounded-2xl font-black uppercase text-xs shadow-lg flex justify-center">
                    {submitting ? <Loader2 className="animate-spin" /> : "VALIDER L'ACCÈS"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}