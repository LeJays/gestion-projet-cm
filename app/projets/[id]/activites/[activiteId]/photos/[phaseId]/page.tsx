"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, Download } from 'lucide-react';
export const runtime = 'edge';

export default function GaleriePhotosPhase() {
  const { phaseId } = useParams();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [phaseNom, setPhaseNom] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from('phases').select('nom, photos_expert').eq('id', phaseId).single();
      if (data) {
        setPhotos(data.photos_expert || []);
        setPhaseNom(data.nom);
      }
    };
    fetchPhotos();
  }, [phaseId]);

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-gray-400 hover:text-[#00AEEF]">
          <ArrowLeft size={20} /> Fermer la galerie
        </button>
        <h1 className="text-xl font-black uppercase italic">{phaseNom} <span className="text-[#00AEEF]">— Preuves Terrain</span></h1>
      </header>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
          <ImageIcon size={64} className="mb-4 opacity-20" />
          <p className="font-black uppercase tracking-widest text-xs">Aucune photo disponible pour cette phase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((url, idx) => (
            <div key={idx} className="group relative aspect-video bg-gray-900 rounded-[2rem] overflow-hidden border-2 border-transparent hover:border-[#00AEEF] transition-all">
              <img src={url} alt={`Preuve ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <a href={url} target="_blank" className="absolute bottom-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Download size={20} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
