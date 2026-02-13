"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, Users, ShieldCheck, HardHat, Loader2, X, 
  Phone, Mail, Lock, Edit3, Trash2, ShieldAlert 
} from 'lucide-react';

export default function GestionStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'expert',
    titre: '',
    password: '' 
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const { data } = await supabase.from('profils').select('*').order('created_at', { ascending: false });
    if (data) setStaff(data);
    setLoading(false);
  }

  // Ouvrir pour modification
  const openEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      nom: member.nom,
      email: member.email,
      telephone: member.telephone || '',
      role: member.role,
      titre: member.titre || '',
      password: '' // On laisse vide car on ne peut pas lire l'ancien
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("🚨 ATTENTION : Supprimer ce membre révoquera tous ses accès. Confirmer ?")) {
      const { error } = await supabase.from('profils').delete().eq('id', id);
      if (!error) {
        alert("Membre retiré du staff.");
        fetchStaff();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingId) {
      // MODE MISE À JOUR
      const { error: profileError } = await supabase
        .from('profils')
        .update({
          nom: formData.nom,
          telephone: formData.telephone,
          role: formData.role,
          titre: formData.titre
        })
        .eq('id', editingId);

      if (!profileError) {
        alert("Profil mis à jour !");
        closeModal();
        fetchStaff();
      }
    } else {
      // MODE CRÉATION
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        alert("Erreur Auth : " + authError.message);
      } else if (authData.user?.id) {
        const { error: profileError } = await supabase
          .from('profils')
          .insert([{
            id: authData.user.id,
            nom: formData.nom,
            email: formData.email,
            telephone: formData.telephone,
            role: formData.role,
            titre: formData.titre
          }]);
        
        if (!profileError) {
          alert("Nouveau membre enrôlé !");
          closeModal();
          fetchStaff();
        }
      }
    }
    setSubmitting(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nom: '', email: '', telephone: '', role: 'expert', titre: '', password: '' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar userProfile={{ role: 'direction', nom: 'James' }} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Gestion du <span className="text-[#00AEEF]">Personnel</span></h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Équipe NSIK'ARCHI & Droits d'accès</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 hover:bg-[#00AEEF] transition-all shadow-2xl scale-100 hover:scale-105 active:scale-95">
            <Plus size={22} /> ENRÔLER UN COLLABORATEUR
          </button>
        </header>

        {/* GRILLE DES CARTES STAFF - FORMAT LARGE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {staff.map((m) => (
            <div key={m.id} className="bg-white p-8 rounded-[3.5rem] border-2 border-gray-100 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
              
              {/* Statut Icon */}
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 ${m.role === 'assistance' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-[#00AEEF]'}`}>
                {m.role === 'assistance' ? <ShieldCheck size={40} /> : <HardHat size={40} />}
              </div>

              {/* Infos */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <h3 className="font-black uppercase text-xl tracking-tight">{m.nom}</h3>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-[8px] font-black uppercase">{m.role}</span>
                </div>
                <p className="text-[#00AEEF] font-black text-xs uppercase italic mb-4">{m.titre || 'Spécialiste NSIK'}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold text-xs">
                       <Mail size={14} className="text-gray-300"/> {m.email}
                   </div>
                   <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold text-xs">
                       <Phone size={14} className="text-gray-300"/> {m.telephone || 'Non renseigné'}
                   </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
                <button onClick={() => openEdit(m)} className="flex-1 p-4 bg-gray-50 text-gray-400 hover:text-[#00AEEF] hover:bg-blue-50 rounded-2xl transition-colors">
                  <Edit3 size={20} />
                </button>
                <button onClick={() => handleDelete(m.id)} className="flex-1 p-4 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Tag Date */}
              <div className="absolute top-4 right-10 opacity-20 font-black text-[8px] uppercase italic">
                Membre depuis {new Date(m.created_at).getFullYear()}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL AJOUT / MODIF */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={closeModal} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors">
                <X size={32} />
              </button>

              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">
                  {editingId ? "Modifier" : "Enrôler"} <span className="text-[#00AEEF]">Staff</span>
                </h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Dossier RH NSIK'ARCHI</p>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic">Nom Complet du Collaborateur</label>
                  <input type="text" required className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none border-2 border-transparent focus:border-[#00AEEF] transition-all" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic">Email (Identifiant)</label>
                  <input type="email" required disabled={!!editingId} className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none disabled:opacity-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic">Téléphone Direct</label>
                  <input type="tel" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic">Niveau d'accès</label>
                  <select className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-black uppercase text-xs outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="expert">EXPERT (Terrain & Rapports)</option>
                    <option value="assistance">ASSISTANCE (Gestion administrative)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic">Titre Officiel</label>
                  <input type="text" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} />
                </div>

                {!editingId && (
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#7DB95C] ml-4 italic flex items-center gap-1">
                      <Lock size={12}/> Créer le mot de passe initial
                    </label>
                    <input type="password" required className="w-full p-5 bg-green-50/30 border-2 border-green-100 rounded-[1.5rem] font-bold outline-none focus:border-[#7DB95C]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                )}

                <div className="col-span-2 flex flex-col gap-4 mt-8">
                  <button type="submit" disabled={submitting} className="w-full py-6 bg-black text-white rounded-[1.8rem] font-black uppercase text-xs shadow-xl flex justify-center hover:bg-[#00AEEF] transition-all">
                    {submitting ? <Loader2 className="animate-spin" /> : (editingId ? "APPLIQUER LES MODIFICATIONS" : "VALIDER L'ENRÔLEMENT")}
                  </button>
                  {editingId && (
                     <div className="flex items-center gap-2 justify-center text-red-500 font-bold text-[10px] uppercase">
                        <ShieldAlert size={14}/> Les changements de rôles affectent les permissions immédiatement
                     </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}