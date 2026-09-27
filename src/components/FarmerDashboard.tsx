import React, { useState } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Order, Listing } from '../types';

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
  const isHindi = language === 'hi';

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
  const [marketAudit, setMarketAudit] = useState(
    'Indore Mandi: Wheat Lokwan is trading steady at ₹2,580 - ₹2,640/Qtl. Soybean Yellow at ₹4,420/Qtl. Demand from mills is strong.'
  );

  const timeGreeting = getTimeGreeting(language);
  const farmerName = userProfile?.displayName || 'Rajesh Kumar';
  const isHindi = language === 'hi';

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
      const text =
        language === 'hi'
          ? 'एग्रीसेल सोमवार मंडी बुलेटिन: इंदौर मंडी में लोकवान गेहूं २,५८० रुपये प्रति क्विंटल और सोयाबीन ४,४२० रुपये प्रति क्विंटल पर स्थिर है। प्रमाणित तौल पुल पर वजन होते ही बैंक भुगतान सीधे आपके खाते में क्रेडिट कर दिया जाएगा।'
          : 'Agricel Monday Audio Brief: Central MP mandis report steady arrivals of Lokwan wheat at ₹2,580 per quintal. Escrow funds are secured in the neutral bank vault and disbursed automatically upon weighbridge verification.';
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language === 'hi' ? 'hi-IN' : 'en-US';
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
      setNewsRefreshing(false);
      setMarketAudit(
        'Updated Mandi Intelligence: Wheat export demand rising across Malwa corridor. Soybean procurement prices holding firm with 100% escrow backing.'
      );
    }, 800);
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

        {/* Bottom Bar: Trust Guarantees on left + Little 'Monday Audio Brief' button at corner */}
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

          {/* Little Button: Monday Audio Brief with glowing dot at the corner */}
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

      {/* 2. 4 FINANCIAL METRIC CARDS GRID */}
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

      {/* 3. ORDERS LEDGER: Grain Sales & Escrow Payouts */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>{t.ledgerTitle}</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-bold">{t.thTracking}</th>
                <th className="pb-3 font-bold">{t.thCrop}</th>
                <th className="pb-3 font-bold">{t.thBuyer}</th>
                <th className="pb-3 font-bold">{t.thValue}</th>
                <th className="pb-3 font-bold">{t.thStatus}</th>
                <th className="pb-3 font-bold text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active escrow sales yet. List your harvest or explore wholesale buyer demands!
                  </td>
                </tr>
              ) : (
                myOrders.map((o) => {
                  const isSettled = o.status === 'In Transit / Verified' || o.status === 'Settled';
                  const orderValue = (o.verifiedWeight || o.qty || 20) * o.pricePerTon;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {o.trackingId}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        {o.cropInfo}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        <div>{o.buyerName}</div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-500" /> {o.buyerPhone}
                        </span>
                      </td>
                      <td className="py-3.5 font-black text-slate-900 dark:text-white">
                        ₹{orderValue.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            isSettled
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isSettled ? '✅ Bank Disbursed' : '⏳ Escrow Locked'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onTrackOrder(o.trackingId)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                        >
                          Track
                        </motion.button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. REGIONAL MANDI INTELLIGENCE & NEWS AND AGRISENSE AUDIT */}
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
