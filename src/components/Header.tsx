import React, { useState } from 'react';
import { Menu, Globe, ChevronDown } from 'lucide-react';
import type { Language } from '../translations';
import { SUPPORTED_LANGUAGES } from '../translations';
import type { UserRole } from '../types';

interface HeaderProps {
  currentView: 'home' | 'workspace';
  setCurrentView: (view: 'home' | 'workspace') => void;
  language: Language;
  setLanguage?: (lang: Language) => void;
  onOpenNavMenu?: () => void;
  activePortal?: UserRole;
  setActivePortal?: (portal: UserRole) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  openVisionModal?: () => void;
  openGuideModal?: () => void;
  isSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  onOpenNavMenu,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* 1. TOP LEFT: Platform Logo & Title */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-3 group cursor-pointer text-left shrink-0"
          title="Agricel Escrow Hub"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-0.5 shadow-md shadow-emerald-700/25 ring-1 ring-emerald-400/40 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 drop-shadow-md"
            >
              <path
                d="M24 4L39 9.5V22C39 31.5 32.5 39.5 24 44C15.5 39.5 9 31.5 9 22V9.5L24 4Z"
                fill="url(#agri-shield-grad)"
                stroke="url(#agri-shield-stroke)"
                strokeWidth="1.6"
              />
              <path
                d="M24 36V12M24 16C21.5 14 18 16 18 19C21 20 24 18.5 24 16ZM24 16C26.5 14 30 16 30 19C27 20 24 18.5 24 16ZM24 22C20.5 20.5 17 22.5 17 25.5C20.5 26.5 24 24.5 24 22ZM24 22C27.5 20.5 31 22.5 31 25.5C27.5 26.5 24 24.5 24 22ZM24 28C21 27 18 28.5 18 31C21 31.8 24 30 24 28ZM24 28C27 27 30 28.5 30 31C27 31.8 24 30 24 28Z"
                stroke="#FDE047"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="35" r="2.5" fill="#34D399" />
              <defs>
                <linearGradient id="agri-shield-grad" x1="9" y1="4" x2="39" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#064E3B" />
                  <stop offset="0.6" stopColor="#047857" />
                  <stop offset="1" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="agri-shield-stroke" x1="9" y1="4" x2="39" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34D399" />
                  <stop offset="0.5" stopColor="#FBBF24" />
                  <stop offset="1" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                Agri<span className="text-emerald-600 dark:text-emerald-400">cel</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/60 shadow-2xs">
                ESCROW HUB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:block">
              Weighbridge Escrow • Zero Risk
            </p>
          </div>
        </button>

        {/* 2. TOP RIGHT: Quick Language Switcher & Menu Button */}
        <div className="flex items-center gap-2 relative">
          {/* Direct Language Switcher Dropdown */}
          {setLanguage && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                title="Change Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{currentLangMeta.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900">
                      Select Language / भाषा
                    </div>
                    {SUPPORTED_LANGUAGES.map((langItem) => (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          setLanguage(langItem.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                          language === langItem.code
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{langItem.flag}</span>
                          <span>{langItem.nativeName}</span>
                        </span>
                        {language === langItem.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Menu Drawer Toggle Button */}
          {onOpenNavMenu && (
            <button
              onClick={onOpenNavMenu}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all transform hover:scale-102 active:scale-98 cursor-pointer border border-emerald-400/30"
              title="Open Menu / मेनू खोलें"
            >
              <Menu className="w-4 h-4 text-white" />
              <span className="font-extrabold tracking-wide text-xs">
                {language === 'hi' || language === 'bho'
                  ? 'मेनू'
                  : language === 'pa'
                  ? 'ਮੀਨੂ'
                  : language === 'mr'
                  ? 'मेनू'
                  : language === 'gu'
                  ? 'મેનુ'
                  : language === 'te'
                  ? 'మెనూ'
                  : language === 'ta'
                  ? 'மெனு'
                  : language === 'kn'
                  ? 'ಮೆನು'
                  : language === 'bn'
                  ? 'মেনু'
                  : language === 'or'
                  ? 'ମେନୁ'
                  : language === 'ml'
                  ? 'മെനു'
                  : 'Menu'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
