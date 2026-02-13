"use client";
import React, { useState } from 'react';
import { 
  LayoutDashboard, Briefcase, Users, Wallet, 
  LogOut, ShieldCheck, FolderGit2, Menu, X, Archive, 
  TrendingUp,
  ClipboardList
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar({ userProfile }: { userProfile: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // État pour le menu mobile

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getMenuItems = () => {
    const role = userProfile?.role;
    if (role === 'expert') {
      return [
        { name: 'Mon Tableau de Bord', icon: <LayoutDashboard size={20} />, path: '/experts/dashboard' },
        { name: 'Mes Missions', icon: <FolderGit2 size={20} />, path: '/experts/projets' },
      ];
    }
    if (role === 'assistance') {
      return [
        { name: 'Tableau de Bord', icon: <LayoutDashboard size={20} />, path: '/assistance/dashboard' },
        { name: 'Projets & Flux', icon: <Briefcase size={20} />, path: '/assistance/projets' }, // Ajouté ici
        //{ name: 'Annuaire Experts', icon: <Users size={20} />, path: '/staff' },
      ];
    }
    if (role === 'direction') {
      return [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Clients', icon: <Users size={20} />, path: '/clients' },
        { name: 'Projets', icon: <Briefcase size={20} />, path: '/projets' },
        { name: 'Staff NSIK', icon: <Users size={20} />, path: '/staff' },
        { name: 'Finances', icon: <Wallet size={20} />, path: '/finance' },
        { name: 'Investissements', icon: <TrendingUp size={20} />, path: '/investissements' },
        { name: 'Archives', icon: <Archive size={20} />, path: '/archives' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* BOUTON HAMBURGER (Visible uniquement sur Mobile/Tablette) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-gray-900 text-white rounded-2xl shadow-2xl active:scale-90 transition-transform"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY (Fond sombre quand le menu est ouvert sur mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR COMPLÈTE */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r-2 border-gray-100 
        flex flex-col shadow-sm z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* LOGO SECTION */}
        <div className="p-8 mt-12 lg:mt-0">
          <h1 className="text-2xl font-black text-[#00AEEF] tracking-tighter uppercase leading-none italic">
            NSIK<span className="text-gray-900">'</span>ARCHI
          </h1>
          <div className="h-1.5 w-12 bg-[#7DB95C] rounded-full mt-2"></div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false); // Ferme le menu après clic sur mobile
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-300 ${
                  isActive 
                  ? 'bg-gray-900 text-white shadow-xl translate-x-1' 
                  : 'text-gray-900 hover:bg-gray-50 hover:text-[#00AEEF]'
                }`}
              >
                <span className="text-[#00AEEF]">
                  {item.icon}
                </span>
                <span className="text-[10px] uppercase tracking-[0.15em]">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-4 border-t-2 border-gray-100 bg-gray-50/50">
          <div className="bg-white rounded-[1.5rem] p-5 mb-4 border-2 border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-10 h-10 bg-[#7DB95C]/10 rounded-bl-full flex items-center justify-center">
              <ShieldCheck size={14} className="text-[#7DB95C]" />
            </div>
            <p className="text-[11px] font-black text-gray-900 truncate uppercase mb-1">
               {userProfile?.nom || 'Utilisateur'}
            </p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#7DB95C] font-black italic">
              {userProfile?.role === 'direction' && 'Directeur Général'}
              {userProfile?.role === 'expert' && 'Expert Consultant'}
              {userProfile?.role === 'assistance' && 'Assistance de Direction'}
            </p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-5 py-4 text-red-500 font-black hover:bg-red-50 rounded-2xl transition text-[10px] uppercase tracking-[0.2em]"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}