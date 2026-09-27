import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, TrendingUp, ShieldCheck, Play, Square, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Language } from '../translations';
import { getTwoAudioBriefings } from '../translations';

interface DualAudioBriefingStudioProps {
  language: Language;
}

export const DualAudioBriefingStudio: React.FC<DualAudioBriefingStudioProps> = ({ language }) => {
  const [activePlayingId, setActivePlayingId] = useState<'mandi-rates' | 'escrow-payout' | null>(null);
  const isHindi = language === 'hi' || language === 'bho';

  const briefings = getTwoAudioBriefings(language);

  // When language changes, stop current speech so it automatically converts to the new language on next play
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActivePlayingId(null);
  }, [language]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = (id: 'mandi-rates' | 'escrow-payout') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (activePlayingId === id) {
      window.speechSynthesis.cancel();
      setActivePlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setActivePlayingId(id);

    const briefData = id === 'mandi-rates' ? briefings.brief1 : briefings.brief2;
    const utterance = new SpeechSynthesisUtterance(briefData.audioText);
    utterance.lang = briefData.speechLang;
    utterance.rate = isHindi ? 0.92 : 0.96;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setActivePlayingId(null);
    };

    utterance.onerror = () => {
      setActivePlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-5 sm:p-6 text-white border border-emerald-800/60 shadow-xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-800/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {isHindi ? 'दैनिक एआई ऑडियो बुलेटिन (२ प्रसारण)' : 'Daily AI Audio Briefing Studio'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {isHindi ? 'हिंदी एवं English' : 'Hindi & English'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
              {isHindi
                ? 'भाषा बदलने पर ऑडियो स्वतः हिंदी या English में रूपांतरित हो जाता है।'
                : 'Audio automatically converts to Hindi or English when you change the platform language.'}
            </p>
          </div>
        </div>

        {/* Live Active Audio Language Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-bold backdrop-blur-md">
            <span className="text-sm">{isHindi ? '🇮🇳' : '🌐'}</span>
            <span className="text-emerald-300">
              {isHindi ? 'सक्रिय: हिंदी ऑडियो' : 'Active: English Audio'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          </div>
        </div>
      </div>

      {/* 2 Dedicated Audio Briefing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 relative z-10">
        {/* BRIEFING 1: Mandi Rates & Price Spikes */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
            activePlayingId === 'mandi-rates'
              ? 'bg-gradient-to-b from-emerald-900/90 to-slate-900/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl shadow-emerald-950/50'
              : 'bg-slate-800/70 hover:bg-slate-800/90 border-slate-700/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>{briefings.brief1.categoryTag}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                ⏱️ {briefings.brief1.durationLabel}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {briefings.brief1.title}
            </h4>

            <p className="text-xs text-slate-300/90 mt-2 leading-relaxed">
              {briefings.brief1.summary}
            </p>
          </div>

          {/* Equalizer Visualizer & Play Button */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-3">
            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1 h-5">
              {activePlayingId === 'mandi-rates' ? (
                <>
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-4" />
                  <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.6s_infinite_300ms] h-5" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-3" />
                  <span className="w-1 bg-emerald-300 rounded-full animate-[bounce_0.6s_infinite_400ms] h-5" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_150ms] h-4" />
                  <span className="text-[10px] font-bold text-amber-300 ml-1.5 animate-pulse">
                    {isHindi ? 'प्रसारण जारी...' : 'Playing...'}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  {isHindi ? 'ऑडियो १: मंडी भाव व तेजी' : 'Briefing 1: Mandi & Spikes'}
                </span>
              )}
            </div>

            <button
              onClick={() => handleTogglePlay('mandi-rates')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md transform hover:scale-105 active:scale-95 ${
                activePlayingId === 'mandi-rates'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {activePlayingId === 'mandi-rates' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{isHindi ? 'ऑडियो रोकें' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>{isHindi ? 'ऑडियो सुनें' : 'Listen Briefing'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* BRIEFING 2: Escrow Protection & Weighbridge Payout */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
            activePlayingId === 'escrow-payout'
              ? 'bg-gradient-to-b from-teal-900/90 to-slate-900/90 border-teal-400 ring-2 ring-teal-400/40 shadow-xl shadow-teal-950/50'
              : 'bg-slate-800/70 hover:bg-slate-800/90 border-slate-700/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>{briefings.brief2.categoryTag}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                ⏱️ {briefings.brief2.durationLabel}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {briefings.brief2.title}
            </h4>

            <p className="text-xs text-slate-300/90 mt-2 leading-relaxed">
              {briefings.brief2.summary}
            </p>
          </div>

          {/* Equalizer Visualizer & Play Button */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-3">
            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1 h-5">
              {activePlayingId === 'escrow-payout' ? (
                <>
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-4" />
                  <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.6s_infinite_300ms] h-5" />
                  <span className="w-1 bg-blue-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-3" />
                  <span className="w-1 bg-blue-300 rounded-full animate-[bounce_0.6s_infinite_400ms] h-5" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_150ms] h-4" />
                  <span className="text-[10px] font-bold text-amber-300 ml-1.5 animate-pulse">
                    {isHindi ? 'प्रसारण जारी...' : 'Playing...'}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  {isHindi ? 'ऑडियो २: एस्क्रो व तौल भुगतान' : 'Briefing 2: Escrow & Scale'}
                </span>
              )}
            </div>

            <button
              onClick={() => handleTogglePlay('escrow-payout')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md transform hover:scale-105 active:scale-95 ${
                activePlayingId === 'escrow-payout'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {activePlayingId === 'escrow-payout' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{isHindi ? 'ऑडियो रोकें' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>{isHindi ? 'ऑडियो सुनें' : 'Listen Briefing'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
