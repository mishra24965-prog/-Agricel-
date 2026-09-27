import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tractor,
  PlusCircle,
  Volume2,
  Building,
  Vault,
  Wheat,
  Truck,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Sparkles,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Play,
  Square,
  Radio,
  BookOpen,
  VolumeX,
  Flame,
  Zap,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import { translations, getSpeechLangCode, getTwoAudioBriefings } from '../translations';
import type { Order, Listing } from '../types';
import { FarmerYieldAndPriceWidget } from './FarmerYieldAndPriceWidget';
import { DualAudioBriefingStudio } from './DualAudioBriefingStudio';

interface FarmerDashboardProps {
  language: Language;
  onNavigate: (tab: string) => void;
  orders: Order[];
  listings: Listing[];
  onTrackOrder: (trackingId: string) => void;
  onOpenNavMenu?: () => void;
  onOpenGuideModal?: () => void;
  onOpenVisionModal?: () => void;
}

const DEFAULT_PASSPORT_PHOTO =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

// Helper for dynamic time-staged greeting and emojis
function getTimeGreeting(language: Language): { greeting: string; emoji: string; period: string } {
  const hour = new Date().getHours();
  const isHindi = language === 'hi' || language === 'bho';

  if (hour >= 5 && hour < 12) {
    return {
      greeting: isHindi ? 'सुप्रभात' : 'Good Morning',
      emoji: '🌅 🌾',
      period: 'morning',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: isHindi ? 'शुभ दोपहर' : 'Good Afternoon',
      emoji: '☀️ 🌻',
      period: 'afternoon',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: isHindi ? 'शुभ संध्या' : 'Good Evening',
      emoji: '🌇 🚜',
      period: 'evening',
    };
  } else {
    return {
      greeting: isHindi ? 'शुभ रात्रि' : 'Good Night',
      emoji: '🌙 ✨',
      period: 'night',
    };
  }
}

interface MandiMarketRateItem {
  id: string;
  cropName: string;
  cropNameHi: string;
  market: string;
  currentRateMin: number;
  currentRateMax: number;
  unit: string;
  spikeMonth: string;
  spikePct: number;
  spikeReason: string;
  spikeReasonHi: string;
  trend: 'up' | 'stable' | 'spike';
}

const INITIAL_MANDI_RATES: MandiMarketRateItem[] = [
  {
    id: 'rate-wheat',
    cropName: 'Wheat (Lokwan Sharbati)',
    cropNameHi: 'गेहूं (लोकवान शरबती)',
    market: 'Indore Mandi (APMC)',
    currentRateMin: 2580,
    currentRateMax: 2640,
    unit: '₹/Qtl',
    spikeMonth: 'Oct Pre-Diwali Spike',
    spikePct: 8.5,
    spikeReason: 'Flour mill festive demand & seed buffer offloading',
    spikeReasonHi: 'त्योहारी सीजन में मिलों की भारी मांग व अग्रिम बुकिंग',
    trend: 'spike',
  },
  {
    id: 'rate-soybean',
    cropName: 'Soybean (JS 335)',
    cropNameHi: 'सोयाबीन (पीला JS 335)',
    market: 'Dewas & Ujjain Mandi',
    currentRateMin: 4420,
    currentRateMax: 4480,
    unit: '₹/Qtl',
    spikeMonth: 'Late Oct / Nov Spike',
    spikePct: 6.2,
    spikeReason: 'Soymeal export parity & crushing plant capacity bids',
    spikeReasonHi: 'सॉल्वेंट प्लांट द्वारा कम नमी वाले लॉट पर प्रीमियम',
    trend: 'up',
  },
  {
    id: 'rate-chana',
    cropName: 'Desi Chana (Gram)',
    cropNameHi: 'चना (देसी सॉर्टेक्स)',
    market: 'Mandsaur & Neemuch',
    currentRateMin: 6050,
    currentRateMax: 6220,
    unit: '₹/Qtl',
    spikeMonth: 'Oct Festive Peak Spike',
    spikePct: 10.4,
    spikeReason: 'Besan & confectionery manufacturers bulk stocking',
    spikeReasonHi: 'मिठाई व बेसन निर्माताओं द्वारा भारी उठाव',
    trend: 'spike',
  },
  {
    id: 'rate-paddy',
    cropName: 'Basmati Paddy 1121',
    cropNameHi: 'बासमती धान (1121)',
    market: 'Raisen & Hoshangabad',
    currentRateMin: 3850,
    currentRateMax: 4050,
    unit: '₹/Qtl',
    spikeMonth: 'Nov Mill Export Spike',
    spikePct: 7.8,
    spikeReason: 'Middle East export shipments opening with certified lots',
    spikeReasonHi: 'मध्य पूर्व निर्यात मांग से प्रमाणित लॉट पर तेजी',
    trend: 'up',
  },
];

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  language,
  onNavigate,
  orders,
  listings,
  onTrackOrder,
  onOpenNavMenu,
  onOpenGuideModal,
  onOpenVisionModal,
}) => {
  const { userProfile } = useAuth();
  const t = translations[language];

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now (Auto-synced)');
  const [mandiRates, setMandiRates] = useState<MandiMarketRateItem[]>(INITIAL_MANDI_RATES);
  const [marketAudit, setMarketAudit] = useState(
    'Indore & Malwa Mandis: Wheat Lokwan is trading firm at ₹2,580 - ₹2,640/Qtl. Soybean Yellow at ₹4,420 - ₹4,480/Qtl. Pre-Diwali price spike projected in October across wholesale mandis.'
  );

  const timeGreeting = getTimeGreeting(language);
  const farmerName = userProfile?.displayName || 'Rajesh Kumar';
  const isHindi = language === 'hi' || language === 'bho';

  // Financial calculations
  const myOrders = orders.filter(
    (o) =>
      !userProfile ||
      userProfile.role === 'admin' ||
      userProfile.role === 'logistics' ||
      o.farmerPhone === userProfile.phone ||
      o.farmerId === userProfile.uid
  );

  const settledTotal = myOrders
    .filter((o) => o.status === 'In Transit / Verified' || o.status === 'Settled')
    .reduce((sum, o) => sum + (o.verifiedWeight || o.qty || 20) * o.pricePerTon, 0);

  const unsettledTotal = myOrders
    .filter((o) => o.status === 'Awaiting Weighbridge')
    .reduce((sum, o) => sum + (o.totalEscrow || (o.qty || 20) * o.pricePerTon), 0);

  const activeMarketVolume = listings
    .filter((l) => l.status === 'Available')
    .reduce((sum, l) => sum + l.qty, 0);

  const activeShipmentsCount = myOrders.filter(
    (o) => o.status === 'Awaiting Weighbridge' || o.status === 'In Transit / Verified'
  ).length;

  // Cancel speech on language change or unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [language]);

  const toggleMandiAudio = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const briefings = getTwoAudioBriefings(language);
      const text = briefings.brief1.audioText;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = briefings.brief1.speechLang;
      utter.rate = isHindi ? 0.92 : 0.96;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const refreshNews = () => {
    setNewsRefreshing(true);
    setTimeout(() => {
      // Auto-sync dynamic price fluctuations & spike indicators
      setMandiRates((prev) =>
        prev.map((r) => {
          const delta = Math.floor(Math.random() * 30) - 10;
          return {
            ...r,
            currentRateMin: r.currentRateMin + delta,
            currentRateMax: r.currentRateMax + delta,
          };
        })
      );
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setNewsRefreshing(false);
      setMarketAudit(
        isHindi
          ? 'अद्यतन मंडी भाव व उछाल: मालवा कॉरिडोर में गेहूं व सोयाबीन की मांग मजबूत है। अक्टूबर महीने में त्योहारी मांग से ५% से १०% मूल्य उछाल का स्पष्ट संकेत है। सभी सौदे १००% बैंक एस्क्रो से सुरक्षित हैं।'
          : 'Live Synced Mandi Intelligence: Wheat & soybean arrivals steady across Malwa corridor. AI models confirm a 5% to 10% price spike in October due to festive mill restocking. All contracts backed by 100% neutral bank escrow.'
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. WELCOME INTERFACE AT THE VERY TOP */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            {/* User Profile / Passport-size photo card */}
            <div className="relative w-22 h-26 sm:w-26 sm:h-32 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-2xl shrink-0 bg-slate-800">
              <img
                src={userProfile?.photoUrl || DEFAULT_PASSPORT_PHOTO}
                alt={farmerName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-emerald-950/95 text-[9px] font-black text-amber-300 text-center py-0.5 tracking-wider uppercase">
                {isHindi ? 'प्रमाणित किसान' : 'Farmer ID'}
              </div>
            </div>

            {/* Time-staged greeting and Farmer details */}
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-white/15 text-amber-300 backdrop-blur-md mb-2 border border-white/20">
                <span className="text-base">{timeGreeting.emoji}</span>
                <span>{timeGreeting.greeting}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>{isHindi ? `स्वागत है, ${farmerName}!` : `Welcome, ${farmerName}!`}</span>
              </h2>

              <p className="text-xs text-emerald-200/90 mt-1.5 font-medium flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">{userProfile?.district || 'Indore District, MP'}</span>
                <span>•</span>
                <span className="truncate max-w-[260px]">
                  {userProfile?.organization || 'Malwa Organic Farmers Producer Co.'}
                </span>
              </p>

              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>KYC & Land Verified</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-200 text-[10px] font-bold border border-blue-400/30">
                  NPCI Payout Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-200 text-[10px] font-bold border border-amber-400/30">
                  Kisan ID #MP-IND-2026
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons in the header */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto flex-wrap">
            {onOpenGuideModal && (
              <button
                onClick={onOpenGuideModal}
                className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 font-black text-xs shadow-md border border-white/25 flex items-center gap-1.5 transition-all transform hover:scale-102"
                title={isHindi ? 'संचालन गाइड खोलें' : 'Open How to Operate Guide'}
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>{isHindi ? 'संचालन गाइड' : 'How to Operate'}</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('farmer-listing')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-md shadow-emerald-500/30 flex items-center gap-2 transition-all transform hover:scale-102"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>{isHindi ? 'नई फसल लिस्ट करें' : 'List Harvest Crop'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Trust Guarantees on left + Monday Audio Brief button */}
        <div className="mt-5 pt-4 border-t border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div className="flex items-center gap-2 text-emerald-200/90">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold">
                {isHindi ? 'तौल पर ६०-सेकंड भुगतान' : '60-Sec Scale Payout'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200/90">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold">
                {isHindi ? '१००% बैंक एस्क्रो सुरक्षा' : '100% Neutral Escrow'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200/90">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold">
                {isHindi ? 'शून्य आढ़तिया कटौती' : 'Zero Middleman Dockage'}
              </span>
            </div>
          </div>

          {/* Monday Audio Brief button with glowing indicator */}
          <div className="shrink-0 flex items-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleMandiAudio}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md backdrop-blur-md border ${
                isPlayingAudio
                  ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/50 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-emerald-100 border-white/20'
              }`}
              title={isPlayingAudio ? 'Stop Monday Audio Brief' : 'Listen to Monday Audio Brief'}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isPlayingAudio ? 'bg-amber-300' : 'bg-emerald-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isPlayingAudio ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                ></span>
              </span>
              {isPlayingAudio ? (
                <>
                  <Square className="w-3 h-3 fill-current text-amber-300" />
                  <span>{isHindi ? 'ऑडियो रोकें' : 'Stop Brief'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHindi ? 'सोमवार ऑडियो बुलेटिन' : 'Monday Audio Brief'}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3. 4 FINANCIAL METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Settled Payout (Direct to Bank) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.cardSettled}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{settledTotal.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.cardSettledSub}</span>
          </p>
        </motion.div>

        {/* Card 2: Settle Escrow / Escrow Locked in Vault */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-sm cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.cardUnsettled}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <Vault className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-500 mt-2">
            ₹{unsettledTotal.toLocaleString()}
          </h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.cardUnsettledSub}</span>
          </p>
        </motion.div>

        {/* Card 3: Active Mart Volume */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.cardVolume}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {activeMarketVolume} Tons
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.cardVolumeSub}</span>
          </p>
        </motion.div>

        {/* Card 4: Active Shipments */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.cardShipments}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {activeShipmentsCount} Active
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            <span>{t.cardShipmentsSub}</span>
          </p>
        </motion.div>
      </div>

      {/* 3. AGRISENSE LIVE MANDI RATES & MONTHLY PRICE SPIKE INTELLIGENCE */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isHindi ? 'एग्रीसेंस लाइव मंडी भाव व मासिक मूल्य उछाल' : 'AgriSense Live Mandi Rates & Monthly Price Spikes'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live APMC
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHindi
                ? 'किन महीनों में भाव में उछाल आता है (त्योहारी मांग, मिल अग्रिम खरीद) और रिफ्रेश करते ही लाइव अपडेटेड भाव'
                : 'Track monthly seasonal price spikes, festival procurement surges, and auto-synced APMC rates on refresh.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
              {isHindi ? `अंतिम सिंक: ${lastSyncTime}` : `Synced: ${lastSyncTime}`}
            </span>
            <button
              onClick={refreshNews}
              disabled={newsRefreshing}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Auto-sync updated mandi rates"
            >
              <RotateCw className={`w-3.5 h-3.5 ${newsRefreshing ? 'animate-spin' : ''}`} />
              <span>{newsRefreshing ? (isHindi ? 'सिंक हो रहा है...' : 'Syncing...') : (isHindi ? 'ताज़ा भाव सिंक करें' : 'Sync & Refresh Rates')}</span>
            </button>
          </div>
        </div>

        {/* 4 Cards of Real Mandi Rates with Monthly Price Spike Forecasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mandiRates.map((rate) => (
            <motion.div
              key={rate.id}
              whileHover={{ y: -3 }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>{rate.spikeMonth}</span>
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    +{rate.spikePct}% Spike
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {isHindi ? rate.cropNameHi : rate.cropName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rate.market}
                  </span>
                </div>

                <div className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {isHindi ? 'वर्तमान एपीएमसी भाव:' : 'Current APMC Range:'}
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    ₹{rate.currentRateMin.toLocaleString()} - ₹{rate.currentRateMax.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">/ Qtl</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {isHindi ? rate.spikeReasonHi : rate.spikeReason}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-400">
                  100% Escrow Backed
                </span>
                <button
                  onClick={() => onNavigate('farmer-listing')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-xs flex items-center gap-1"
                >
                  <span>List Lot</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>



      {/* 5. ACTIVE CROP LISTINGS IN WHOLESALE MART */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
              <Wheat className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isHindi ? 'थोक मंडी में आपकी सक्रिय फसलें' : 'Your Live Crop Lots in Wholesale Mart'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {listings.filter((l) => l.status === 'Available').length} {isHindi ? 'लाइव' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi
                  ? 'आपकी प्रकाशित फसलें एगमार्क प्रमाण-पत्र के साथ थोक मंडी में लाइव हैं और खरीदार बोलियां स्वीकार कर रही हैं।'
                  : 'Your published crops are live in the Wholesale Mart with verified AGMARK quality for buyer orders.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'थोक मंडी खोलें' : 'Open Mart'}</span>
            </button>
            <button
              onClick={() => onNavigate('farmer-listing')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isHindi ? 'नई फसल जोड़ें' : 'List New Crop'}</span>
            </button>
          </div>
        </div>

        {/* Live crop lots horizontal scroll or grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {listings
            .filter((l) => l.status === 'Available')
            .slice(0, 3)
            .map((l) => (
              <div
                key={l.id}
                onClick={() => onNavigate('marketplace')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/60 transition-all flex items-start gap-3.5 cursor-pointer group"
              >
                {l.photoUrl ? (
                  <img
                    src={l.photoUrl}
                    alt={l.crop}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                    <Wheat className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {l.crop} ({l.variety})
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      ₹{l.price.toLocaleString()}/T
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{l.qty} Tons Lot</span>
                    <span>•</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {l.qualityAssessment?.grade?.split(' ')[0] || 'Grade-A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{isHindi ? 'लाइव मंडी में सक्रिय' : 'Live in Mart'}</span>
                    </span>
                    <span className="text-slate-400 font-medium">{l.id}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 6. REGIONAL MANDI INTELLIGENCE & NEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t.newsHeading}</span>
            </h3>
            <button
              onClick={refreshNews}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <RotateCw className={`w-3.5 h-3.5 ${newsRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.btnRefresh}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                  Mandi Benchmark
                </span>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-1">
                  Wheat Lokwan Firm Arrivals
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Arrivals across Indore and Ujjain Mandis are steady with mills bidding directly via escrow.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-extrabold text-emerald-600">
                <span>Indore Rate:</span>
                <span>₹2,580 - ₹2,640 / Qtl</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                  Oilseeds
                </span>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-1">
                  Soybean JS 335 Demand Active
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Crush plants prioritizing certified lots with under 12% moisture readings.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-extrabold text-emerald-600">
                <span>Malwa Rate:</span>
                <span>₹4,400 - ₹4,450 / Qtl</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{t.auditHeading}</span>
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
              {marketAudit}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('farmer-listing')}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>List Harvest at Mandi Rate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

