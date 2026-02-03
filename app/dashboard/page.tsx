"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { Briefcase, AlertCircle, Banknote, Loader2, TrendingUp, PieChart as PieIcon } from 'lucide-react';
// Importation des composants de graphiques
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projetsActifs: 0,
    dettesPrepaye: 0,
    chiffreAffaire: 0
  });
  const router = useRouter();

  // Données pour les graphiques
  const [performanceData, setPerformanceData] = useState([
    { name: 'Jan', montant: 0 },
    { name: 'Fév', montant: 0 },
    { name: 'Mar', montant: 0 },
    { name: 'Avr', montant: 0 },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data: prof } = await supabase.from('profils').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      const { count: countProjets } = await supabase.from('projets').select('*', { count: 'exact', head: true });
      const { data: phases } = await supabase.from('phases').select('montant_reel, statut_paiement');

      let totalCA = 0;
      let totalDettes = 0;

      if (phases) {
        phases.forEach(p => {
          if (p.statut_paiement === 'paye') totalCA += (p.montant_reel || 0);
          else if (p.statut_paiement === 'prepaye') totalDettes += (p.montant_reel || 0);
        });
      }

      setStats({ projetsActifs: countProjets || 0, dettesPrepaye: totalDettes, chiffreAffaire: totalCA });
      
      // Simulation de données de croissance pour le graphe
      setPerformanceData([
        { name: 'Jan', montant: totalCA * 0.4 },
        { name: 'Fév', montant: totalCA * 0.6 },
        { name: 'Mar', montant: totalCA * 0.8 },
        { name: 'Avr', montant: totalCA },
      ]);

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  // Données pour le camembert (Pie Chart)
  const pieData = [
    { name: 'Encaissé', value: stats.chiffreAffaire, color: '#7DB95C' },
    { name: 'Dettes', value: stats.dettesPrepaye, color: '#EF4444' },
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#00AEEF]" size={40} />
      <div className="text-gray-900 font-black text-xs uppercase tracking-[0.3em]">CHARGEMENT NSIK...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Sidebar userProfile={profile} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
              Bonjour, <span className="text-[#00AEEF]">{profile?.nom}</span>
            </h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Management de projet & suivi financier</p>
          </div>
          <div className="bg-white px-8 py-4 rounded-[2rem] shadow-sm border-2 border-gray-200 text-right font-black">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 italic">Yaoundé, CM</p>
            <p className="text-sm uppercase">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
          </div>
        </header>

        {/* 3 CARTES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-b-8 border-[#00AEEF]">
                <Briefcase className="text-[#00AEEF] mb-4" size={32} />
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Projets Actifs</p>
                <p className="text-5xl font-black text-gray-900 mt-2">{stats.projetsActifs}</p>
            </div>
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-b-8 border-red-500">
                <AlertCircle className="text-red-500 mb-4" size={32} />
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Dettes (Prépayé)</p>
                <p className="text-3xl font-black text-gray-900 mt-2">{stats.dettesPrepaye.toLocaleString()} <span className="text-xs">FCFA</span></p>
            </div>
            <div className="bg-gray-900 p-8 rounded-[3rem] shadow-xl border-b-8 border-[#7DB95C]">
                <Banknote className="text-[#7DB95C] mb-4" size={32} />
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Encaissé</p>
                <p className="text-3xl font-black text-white mt-2">{stats.chiffreAffaire.toLocaleString()} <span className="text-xs">FCFA</span></p>
            </div>
        </div>

        {/* SECTION GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GRAPHE DE CROISSANCE */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-md border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="text-[#00AEEF]" />
                    <h3 className="font-black uppercase text-sm tracking-widest italic text-gray-900">Croissance Chiffre d'Affaire</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#00AEEF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                            <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="montant" stroke="#00AEEF" strokeWidth={4} fill="url(#colorMontant)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRAPHE DE RÉPARTITION */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-md border-2 border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-8 self-start text-gray-900">
                    <PieIcon className="text-[#7DB95C]" />
                    <h3 className="font-black uppercase text-sm tracking-widest italic">État de la Trésorerie</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-4">
                    {pieData.map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}