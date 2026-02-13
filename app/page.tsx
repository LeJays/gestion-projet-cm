"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, LogIn, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export const runtime = 'edge'; // Ajoute ceci juste après tes imports

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Authentification
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert("Erreur d'authentification : " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Récupération du rôle dans la table profils
      const { data: profile, error: profileError } = await supabase
        .from('profils')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        alert("Erreur : Impossible de récupérer votre rôle utilisateur.");
        setLoading(false);
        return;
      }

      // 3. Triage vers le bon Dashboard
      switch (profile.role) {
        case 'direction':
          router.push('/dashboard');
          break;
        case 'expert':
          router.push('/experts/dashboard');
          break;
        case 'assistance':
          router.push('/assistance/dashboard');
          break;
        default:
          alert("Accès refusé : Rôle non configuré.");
          await supabase.auth.signOut();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,174,239,0.2)] p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#00AEEF] tracking-tighter uppercase italic">
            NSIK<span className="text-gray-900">'</span>ARCHI
          </h1>
          <div className="h-1.5 w-16 bg-[#7DB95C] mx-auto mt-2 rounded-full"></div>
          <p className="text-gray-500 mt-6 font-black uppercase text-[10px] tracking-[0.2em]">Accès Plateforme Sécurisé</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Identifiant</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-[#00AEEF]" size={20} />
              <input 
                type="email" required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-bold focus:border-[#7DB95C] focus:bg-white outline-none transition-all"
                placeholder="email@nsikarchi.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-[#00AEEF]" size={20} />
              <input 
                type="password" required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 font-bold focus:border-[#7DB95C] focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-gray-900 hover:bg-[#00AEEF] text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={18} /> ENTRER DANS LE SYSTÈME</>}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <Link href="/register" className="text-[10px] font-black text-gray-400 hover:text-[#00AEEF] transition uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldAlert size={14} /> Nouveau collaborateur ? Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}