import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MusicPlayer() {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrack = "My Chemical Romance - Welcome to the Black Parade";

  return (
    <div className="bg-[#1a1a1a] p-3 rounded-xl border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] font-mono">
      <div className="bg-black p-2 rounded border border-green-500/20 mb-3 overflow-hidden">
        <div className="text-[9px] text-green-500 mb-1 flex justify-between uppercase tracking-widest opacity-50">
          <span>{t('now_playing')}</span>
          <span className="animate-pulse">128kbps</span>
        </div>
        <div className="whitespace-nowrap overflow-hidden">
          <div className="animate-marquee-fast inline-block text-green-400 text-xs uppercase tracking-tighter">
            {currentTrack} • {currentTrack} • 
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-green-500/10 rounded text-green-500/50 hover:text-green-500 transition-all">
            <SkipBack size={14} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded text-green-500 transition-all"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button className="p-1.5 hover:bg-green-500/10 rounded text-green-500/50 hover:text-green-500 transition-all">
            <SkipForward size={14} />
          </button>
        </div>
        <div className="flex-1 h-1 bg-green-500/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-400"
            initial={{ width: '30%' }}
            animate={{ width: isPlaying ? '100%' : '30%' }}
            transition={{ duration: 180, ease: "linear" }}
          />
        </div>
        <Volume2 size={12} className="text-green-500/30" />
      </div>
    </div>
  );
}
