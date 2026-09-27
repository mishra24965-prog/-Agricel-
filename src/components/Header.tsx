import React from 'react';
import { Menu } from 'lucide-react';
import type { Language } from '../translations';
import type { UserRole } from '../types';

interface HeaderProps {
  currentView: 'home' | 'workspace';
  setCurrentView: (view: 'home' | 'workspace') => void;
  language: Language;
  onOpenNavMenu?: () => void;
  activePortal?: UserRole;
  setActivePortal?: (portal: UserRole) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  setLanguage?: (lang: Language) => void;
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
  onOpenNavMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* 1. TOP LEFT: Better Platform Logo & Platform Name */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-3 group cursor-pointer text-left"
          title="Agricel Escrow Hub"
        >
          {/* Handcrafted SVG Platform Logo (Escrow Shield + Golden Wheat Stalk + Escrow Core) */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-0.5 shadow-lg shadow-emerald-700/25 ring-1 ring-emerald-400/40 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 drop-shadow-md"
            >
              {/* Protective Escrow Vault Shield */}
              <path
                d="M24 4L39 9.5V22C39 31.5 32.5 39.5 24 44C15.5 39.5 9 31.5 9 22V9.5L24 4Z"
                fill="url(#agri-shield-grad)"
                stroke="url(#agri-shield-stroke)"
                strokeWidth="1.6"
              />
              {/* Golden Wheat Grains Stalk */}
              <path
                d="M24 36V12M24 16C21.5 14 18 16 18 19C21 20 24 18.5 24 16ZM24 16C26.5 14 30 16 30 19C27 20 24 18.5 24 16ZM24 22C20.5 20.5 17 22.5 17 25.5C20.5 26.5 24 24.5 24 22ZM24 22C27.5 20.5 31 22.5 31 25.5C27.5 26.5 24 24.5 24 22ZM24 28C21 27 18 28.5 18 31C21 31.8 24 30 24 28ZM24 28C27 27 30 28.5 30 31C27 31.8 24 30 24 28Z"
                stroke="#FDE047"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Escrow Core Node */}
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

          {/* Brand Titles */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                Agri<span className="text-emerald-600 dark:text-emerald-400">cel</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/60 shadow-2xs">
                ESCROW HUB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium tracking-wide mt-1 hidden sm:block">
              Weighbridge Escrow • Zero Counterparty Risk
            </p>
          </div>
        </button>

        {/* 2. TOP RIGHT: The Menu Button Widget */}
        {onOpenNavMenu && (
          <button
            onClick={onOpenNavMenu}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/30"
            title={language === 'hi' ? 'पोर्टल मेनू खोलें (3-लाइन्स)' : 'Open Portal Menu (3-Lines)'}
          >
            <Menu className="w-4 h-4 text-white" />
            <span className="font-extrabold tracking-wide text-xs">
              {language === 'hi' ? 'मेनू' : 'Menu'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
