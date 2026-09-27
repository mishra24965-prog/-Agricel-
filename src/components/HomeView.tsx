import React from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import {
  ShieldCheck,
  Tractor,
  Store,
  Camera,
  Wheat,
  Lock,
  Scale,
  CheckCircle,
  Coins,
  PackageOpen,
  Zap,
  ArrowRight,
} from 'lucide-react';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Listing, Order } from '../types';

interface HomeViewProps {
  language: Language;
  onNavigate: (tab: string) => void;
  openVisionModal: () => void;
  listings: Listing[];
  orders: Order[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigate,
  openVisionModal,
  listings,
  orders,
}) => {
  const t = translations[language];

  const totalEscrowAmount = orders.reduce((sum, o) => sum + (o.totalEscrow || 0), 0);
  const totalTonnage = listings.reduce((sum, l) => sum + (l.status === 'Available' ? l.qty : 0), 0);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 max-w-7xl mx-auto p-4 md:p-8 space-y-10"
    >
      {/* Hero Banner with Animated Ambient Glow */}
      <motion.section
        variants={itemVariants}
        className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-8 md:p-14 text-white overflow-hidden shadow-2xl border border-emerald-800/40"
      >
        <div className="absolute -right-16 -bottom-16 opacity-10 text-[280px] pointer-events-none animate-float">
          <Wheat className="w-72 h-72" />
        </div>
        <div className="max-w-3xl space-y-6 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{t.heroBadge}</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            Direct Farm Wholesale with{' '}
            <span className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-8">
              Automated Weighbridge Payouts
            </span>
          </h2>
          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
            {t.heroDesc}
          </p>
          <div className="flex flex-wrap gap-3.5 pt-2">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('farmer-dashboard')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs md:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Tractor className="w-4 h-4" />
              <span>{t.btnFarmerPortal}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('marketplace')}
              className="bg-white text-slate-900 hover:bg-slate-100 font-black px-6 py-3.5 rounded-2xl text-xs md:text-sm shadow-xl transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>{t.btnExploreMart}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={openVisionModal}
              className="bg-purple-600/90 hover:bg-purple-600 text-white font-extrabold px-5 py-3.5 rounded-2xl text-xs shadow-xl transition-all border border-purple-400/40 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>{t.btnAiInspector}</span>
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* WHAT IS ESCROW? (PLAIN-LANGUAGE VISUAL 4-STEP GUIDE WITH ANIMATED HOVER) */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {t.escrowBadge}
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {t.escrowHeading}
          </h3>
          <p
            className="text-xs md:text-sm text-slate-500 dark:text-slate-400"
            dangerouslySetInnerHTML={{ __html: t.escrowSub }}
          ></p>
        </div>

        {/* 4-Step Diagram with Spring Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 hover:shadow-lg transition-colors cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center text-sm mb-3 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                1
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                {t.step1Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5" />
              <span>{t.step1Tag}</span>
            </span>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-amber-500/50 hover:shadow-lg transition-colors cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 bg-amber-500 text-white font-black rounded-xl flex items-center justify-center text-sm mb-3 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                2
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                {t.step2Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>{t.step2Tag}</span>
            </span>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-lg transition-colors cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center text-sm mb-3 shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                3
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                {t.step3Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>{t.step3Tag}</span>
            </span>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-teal-500/50 hover:shadow-lg transition-colors cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 bg-teal-600 text-white font-black rounded-xl flex items-center justify-center text-sm mb-3 shadow-md shadow-teal-600/20 group-hover:scale-110 transition-transform">
                4
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                {t.step4Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.step4Desc}
              </p>
            </div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t.step4Tag}</span>
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* Live Telemetry Strip with Animated Cards */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.statEscrow}
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{totalEscrowAmount.toLocaleString()}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shadow-inner">
            <PackageOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.statHarvest}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalTonnage} Tons
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6 p-3 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shadow-inner">
            <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.statSpeed}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {t.statSpeedVal}
            </div>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};
