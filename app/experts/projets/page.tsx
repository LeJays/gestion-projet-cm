"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { FolderKanban, Calendar, ArrowRight, Loader2, Info } from 'lucide-react';

export default function MesProjetsExpert() {
  const [projets, setProjets] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExpertData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // 1. Récupérer le profil
      const { data: prof } = await supabase.from('profils').select('*').eq('id', user.id).single();
      setProfile(prof);

      // 2. RÉCUPÉRATION DIRECTE DES PROJETS VIA LES PHASES
      // On récupère tout le chemin d'un coup
      const { data: phasesData, error } = await supabase
        .from('phases')
        .select(`
          activites (
            projets (*)
          )
        `)
        .eq('expert_id', user.id);

      if (error) {
        console.error("Erreur de récupération:", error);
      } else if (phasesData) {
        // Extraction des projets uniques
        const uniqueProjets = new Map();
        
        phasesData.forEach((item: any) => {
          // On gère le fait que activites ou projets puissent être des objets ou des tableaux
          const activite = Array.isArray(item.activites) ? item.activites[0] : item.activites;
          if (activite) {
            const projet = Array.isArray(activite.projets) ? activite.projets[0] : activite.projets;
            if (projet && projet.id) {
              uniqueProjets.set(projet.id, projet);
            }
          }
        });

        setProjets(Array.from(uniqueProjets.values()));
      }
      
      setLoading(false);
    };

    fetchExpertData();
  }, [router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] bg-white italic">
      <Loader2 className="animate-spin mr-2" /> CHARGEMENT DE VOS MISSIONS...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={profile} />
      
      <main className="flex-1 p-8">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 uppercase italic tracking-tighter">
            Mes <span className="text-[#00AEEF]">Missions</span>
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 italic">
             Liste des chantiers actifs pour {profile?.nom}
          </p>
        </header>

        {projets.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-black uppercase text-xs tracking-widest">
                Aucun projet trouvé.
            </p>
            <p className="text-gray-400 text-[10px] mt-2 italic">
                Contactez l'administration si cela semble être une erreur.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projets.map((projet) => (
              <div key={projet.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border-2 border-transparent hover:border-[#00AEEF] transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-gray-900 rounded-2xl text-white group-hover:bg-[#00AEEF] transition-colors">
                    <FolderKanban size={28} />
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    ID: {projet.id.slice(0, 8)}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-gray-900 uppercase mb-4 group-hover:text-[#00AEEF] transition-colors">
                  {projet.nom}
                </h3>
                
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase mb-10 tracking-widest">
                    <Calendar size={14} className="text-[#7DB95C]" />
                    <span>Échéance : {projet.delai_livraison ? new Date(projet.delai_livraison).toLocaleDateString() : 'À définir'}</span>
                </div>
                
                <button 
                  onClick={() => router.push(`/experts/projets/${projet.id}`)}
                  className="w-full py-5 bg-gray-50 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center justify-center gap-3 group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm"
                >
                  Ouvrir le chantier <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}