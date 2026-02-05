"use client";
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, Image as ImageIcon, CheckCircle2, Info, Loader2, Landmark, Upload, X } from 'lucide-react';

export default function DetailPhaseExpert() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [phase, setPhase] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [statut, setStatut] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase.from('profils').select('*').eq('id', user.id).single();
    setProfile(prof);

    const { data: p } = await supabase
      .from('phases')
      .select(`*, activites (nom, projets (nom))`)
      .eq('id', id)
      .single();

    if (p) {
      setPhase(p);
      setStatut(p.statut_avancement);
      setPhotos(p.photos_expert || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`; 

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('justificatifs')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw new Error("Erreur Storage: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('justificatifs')
        .getPublicUrl(fileName);

      const nouvellesPhotos = [...photos, publicUrl];
      const { error: updateError } = await supabase
        .from('phases')
        .update({ photos_expert: nouvellesPhotos })
        .eq('id', id);

      if (updateError) throw new Error("Erreur DB: " + updateError.message);
      
      setPhotos(nouvellesPhotos);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('phases')
      .update({ statut_avancement: statut })
      .eq('id', id);

    if (!error) alert("Modifications enregistrées !");
    setUpdating(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#00AEEF] italic">CHARGEMENT DU CHANTIER...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar userProfile={profile} />
      
      <main className="flex-1 p-8">
        <header className="max-w-5xl mx-auto mb-10">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-6 hover:text-black transition-all">
            <ArrowLeft size={14} /> Retour aux missions
          </button>
          <p className="text-[#7DB95C] font-black text-[10px] uppercase tracking-widest">{phase?.activites?.projets?.nom}</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">{phase?.nom}</h1>
        </header>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : INFOS GÉNÉRALES */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                <Info size={16} className="text-[#00AEEF]" /> Description de la mission
              </h3>
              <p className="text-gray-600 italic leading-relaxed">
                {phase?.description || "Aucune description fournie pour cette phase."}
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-xl">
               <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Honoraires</p>
                  <p className="text-3xl font-black text-[#00AEEF]">{phase?.montant_expert?.toLocaleString()} <span className="text-xs">FCFA</span></p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Échéance</p>
                  <p className="font-bold">{phase?.delai ? new Date(phase.delai).toLocaleDateString('fr-FR') : 'NC'}</p>
               </div>
            </div>
          </div>

          {/* COLONNE DROITE : STATUT & PHOTOS (CONDITIONNEL) */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-gray-50 h-fit">
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 text-center tracking-widest">Mise à jour du statut</h3>
              
              <div className="space-y-3 mb-8">
                {['en_attente', 'en_cours', 'termine'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatut(s)}
                    className={`w-full p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between border-2 transition-all ${
                      statut === s ? 'border-[#00AEEF] bg-blue-50 text-[#00AEEF]' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {s.replace('_', ' ')}
                    {statut === s && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>

              {/* ZONE PHOTOS : APPARAIT SEULEMENT SI "TERMINE" EST SELECTIONNÉ */}
              {statut === 'termine' && (
                <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-6 bg-orange-50 rounded-[2rem] border-2 border-dashed border-orange-200">
                    <h4 className="text-[9px] font-black uppercase text-orange-600 mb-3 flex items-center gap-2 tracking-widest">
                      <ImageIcon size={14} /> Preuves (Optionnel)
                    </h4>
                    
                    {/* Galerie miniature */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {photos.map((url, index) => (
                        <div key={index} className="aspect-square rounded-xl overflow-hidden border border-orange-200">
                          <img src={url} alt="justificatif" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-3 bg-white border-2 border-orange-200 rounded-xl text-[9px] font-black text-orange-600 uppercase flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                    >
                      {uploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                      {uploading ? "Envoi..." : "Ajouter une photo"}
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={handleSave}
                disabled={updating}
                className="w-full py-6 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#7DB95C] transition-all shadow-lg shadow-gray-200"
              >
                {updating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Valider les changements
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}