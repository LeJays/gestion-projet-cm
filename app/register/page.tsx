"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', password: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profils')
        .insert([{ 
          id: data.user.id, 
          nom: formData.nom, 
          telephone: formData.telephone, 
          email: formData.email 
        }]);

      if (profileError) alert("Erreur profil : " + profileError.message);
      else setIsSubmitted(true);
    }
    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#00AEEF]">NSIK'ARCHI</h2>
          <p className="mt-4 text-gray-700">Vérifiez votre email pour activer votre compte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00AEEF] to-[#7DB95C] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[#00AEEF] tracking-tighter">NSIK'ARCHI</h1>
          <p className="text-[#7DB95C] font-semibold text-sm">Architecture & Ingénierie</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600">Nom Complet</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-[#00AEEF]" size={20} />
              <input 
                type="text" required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#7DB95C] outline-none"
                placeholder="Votre nom"
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-[#00AEEF]" size={20} />
              <input 
                type="email" required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#7DB95C] outline-none"
                placeholder="votre@email.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Téléphone</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 text-[#00AEEF]" size={20} />
              <input 
                type="tel" required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#7DB95C] outline-none"
                placeholder="653784790"
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Mot de passe</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-[#00AEEF]" size={20} />
              <input 
                type="password" required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#7DB95C] outline-none"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-[#008cc0] text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "CRÉER MON COMPTE"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-500 font-medium italic">
          Contact NSIK'ARCHI : (+237) 653 784 790
        </p>
      </div>
    </div>
  );
}