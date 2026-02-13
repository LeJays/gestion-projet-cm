"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, AlertCircle, Banknote, Loader2, 
  TrendingUp, Clock, ChevronRight, RotateCcw, PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend,
  PieChart, Pie
} from 'recharts';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projetsActifs: 0,
    dettesPrepaye: 0,
    chiffreAffaire: 0
  });
  const [alertes, setAlertes] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [expertData, setExpertData] = useState<any[]>([]);
  const [statutData, setStatutData] = useState<any[]>([]); // Nouvel état pour le diagramme circulaire
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data: prof } = await supabase.from('profils').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      const { data: projets } = await supabase.from('projets').select('*, clients(nom)');
      const { data: phases } = await supabase.from('phases').select('statut_avancement, profils(nom)');

      if (projets) {
        let totalCA = 0;
        let totalDettes = 0;
        let actifs = 0;

        // Logique pour le diagramme de statut des projets
        let countAttente = 0;
        let countEnCours = 0;
        let countTermine = 0;

        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        const statsParMois: any = {};
        moisNoms.forEach(m => statsParMois[m] = { name: m, encaisse: 0, dette: 0 });

        projets.forEach(p => {
          const encaisse = p.type_projet === 'standard' ? Number(p.montant_total || 0) : Number(p.montant_paye || 0);
          const dette = Number(p.montant_total || 0) - encaisse;
          totalCA += encaisse;
          totalDettes += dette;
          
          // Comptage des statuts pour le PieChart
          if (p.statut_projet === 'termine') countTermine++;
          else if (p.statut_projet === 'en_cours') countEnCours++;
          else countAttente++;

          if (p.statut_projet !== 'termine') actifs++;

          const mois = moisNoms[new Date(p.created_at).getMonth()] || 'Jan';
          if (statsParMois[mois]) {
            statsParMois[mois].encaisse += encaisse;
            statsParMois[mois].dette += dette;
          }
        });

        setStats({ projetsActifs: actifs, dettesPrepaye: totalDettes, chiffreAffaire: totalCA });
        setPerformanceData(Object.values(statsParMois));
        
        setStatutData([
          { name: 'En attente', value: countAttente, color: '#94A3B8' },
          { name: 'En cours', value: countEnCours, color: '#00AEEF' },
          { name: 'Terminés', value: countTermine, color: '#7DB95C' }
        ]);

        const urgences = projets
          .filter(p => (Number(p.montant_total) - (Number(p.montant_paye) || 0)) > 0)
          .sort((a, b) => (Number(b.montant_total) - Number(b.montant_paye)) - (Number(a.montant_total) - Number(a.montant_paye)))
          .slice(0, 4);
        setAlertes(urgences);
      }

      if (phases) {
        const counts: any = {};
        phases.forEach(ph => {
          if (ph.statut_avancement === 'en_attente' && ph.profils) {
            const profObj = Array.isArray(ph.profils) ? ph.profils[0] : ph.profils;
            if (profObj?.nom) counts[profObj.nom] = (counts[profObj.nom] || 0) + 1;
          }
        });
        setExpertData(Object.keys(counts).map(name => ({ name, phases: counts[name] })).sort((a,b) => b.phases - a.phases).slice(0, 5));
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [router]);

  const formatCurrency = (value: any) => `${value.toLocaleString()} F`;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#00AEEF]" size={40} />
      <div className="text-gray-900 font-black text-xs uppercase tracking-[0.3em]">CHARGEMENT NSIK...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar userProfile={profile} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
              Bonjour, <span className="text-[#00AEEF]">{profile?.nom?.split(' ')[0]}</span>
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
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Dettes Clients</p>
                <p className="text-3xl font-black text-gray-900 mt-2">{stats.dettesPrepaye.toLocaleString()} <span className="text-xs">F</span></p>
            </div>
            <div className="bg-gray-900 p-8 rounded-[3rem] shadow-xl border-b-8 border-[#7DB95C]">
                <Banknote className="text-[#7DB95C] mb-4" size={32} />
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-gray-500">Total Encaissé</p>
                <p className="text-3xl font-black text-white mt-2">{stats.chiffreAffaire.toLocaleString()} <span className="text-xs">F</span></p>
            </div>
        </div>

        {/* SECTION GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* COMPARATIF DETTE / ENCAISSE */}
            <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-md border-2 border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-[#00AEEF]" />
                        <h3 className="font-black uppercase text-xs tracking-widest italic text-gray-900">Encaisse vs Dette (Semestriel)</h3>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                            <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold'}} formatter={formatCurrency} />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                            <Area name="Encaissé" type="monotone" dataKey="encaisse" stroke="#7DB95C" strokeWidth={4} fill="#7DB95C" fillOpacity={0.1} />
                            <Area name="Dette" type="monotone" dataKey="dette" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" fill="#EF4444" fillOpacity={0.05} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* NOUVEAU DIAGRAMME : STATUT DES PROJETS */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-md border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <PieIcon className="text-[#00AEEF]" />
                    <h3 className="font-black uppercase text-xs tracking-widest italic text-gray-900">État des Projets</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {statutData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '900', textTransform: 'uppercase'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* SUIVI EXPERTS */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-md border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <RotateCcw className="text-orange-500" />
                    <h3 className="font-black uppercase text-xs tracking-widest italic text-gray-900">Dossiers en attente / Expert</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expertData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#111827', fontSize: 10, fontWeight: 900}} width={100} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="phases" radius={[0, 10, 10, 0]} barSize={15}>
                                {expertData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : '#00AEEF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RELANCES URGENTES (DÉPLACÉ ICI POUR L'ÉQUILIBRE) */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-md border-2 border-gray-100">
                <h3 className="font-black uppercase text-xs tracking-widest italic mb-8 flex items-center gap-2">
                    <Clock size={18} className="text-orange-500" /> Relances Urgentes
                </h3>
                <div className="space-y-4">
                    {alertes.map((alt) => {
                        const detteRestante = Number(alt.montant_total) - (Number(alt.montant_paye) || 0);
                        return (
                            <div key={alt.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl group hover:bg-red-50 transition-colors">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-900 truncate">{alt.nom}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase italic">{alt.clients?.nom}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-red-600">{detteRestante.toLocaleString()} F</p>
                                    <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-red-500" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}