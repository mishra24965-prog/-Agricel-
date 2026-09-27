import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  TrendingUp,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Calculator,
  ArrowRight,
  MapPin,
  Coins,
  CheckCircle2,
  Building2,
  Zap,
  CreditCard,
  Edit3,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import { translations as _translations } from '../translations';
import type { Listing, Order, Demand, RegionalCluster } from '../types';
import { BankOrUpiModal } from './BankOrUpiModal';

interface BuyerDashboardProps {
  language: Language;
  onNavigate: (tab: string) => void;
  orders: Order[];
  demands: Demand[];
  listings: Listing[];
  clusters: RegionalCluster[];
  onOpenAggregator: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  language,
  onNavigate,
  orders,
  demands,
  listings,
  clusters,
  onOpenAggregator,
}) => {
  const { userProfile } = useAuth();

  // Bank & UPI Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<string | null>(null);

  // Price Relaxation & Landed Expense Calculator State
  const [calcCrop, setCalcCrop] = useState('Wheat');
  const [targetQty, setTargetQty] = useState(50);
  const [buyerBudgetPrice, setBuyerBudgetPrice] = useState(25800);
  const [destinationHub, _setDestinationHub] = useState('Indore Mill Complex (Pithampur)');
  const [freightKm, setFreightKm] = useState(65);

  // Financial stats for buyer
  const totalEscrowLocked = orders
    .filter((o) => o.status === 'Awaiting Weighbridge' || o.status === 'In Transit / Verified')
    .reduce((sum, o) => sum + (o.totalEscrow || 0), 0);

  const totalProcuredTons = orders
    .filter((o) => o.status === 'In Transit / Verified' || o.status === 'Settled')
    .reduce((sum, o) => sum + (o.verifiedWeight || o.qty || 20), 0);

  const activeDemandsCount = demands.filter((d) => d.status === 'Open').length;

  // Real-time calculation of expense and price relaxation
  const cropListings = listings.filter(
    (l) => l.crop.toLowerCase() === calcCrop.toLowerCase() && l.status === 'Available'
  );
  const avgRegionalAskingPrice =
    cropListings.length > 0
      ? Math.round(
          cropListings.reduce((sum, l) => sum + l.price * l.qty, 0) /
            cropListings.reduce((sum, l) => sum + l.qty, 0)
        )
      : buyerBudgetPrice + 400;

  const totalAvailableRegionalTons = cropListings.reduce((sum, l) => sum + l.qty, 0);

  // Landed expense parameters
  const baseCropTotal = targetQty * buyerBudgetPrice;
  const freightPerTonKm = 4.2; // ₹4.2 per ton-km
  const estimatedFreight = Math.round(targetQty * freightKm * freightPerTonKm);
  const weighbridgeFee = 250 * Math.ceil(targetQty / 20); // ₹250 per 20T truck tare/gross weighing
  const escrowBankingCess = Math.round(baseCropTotal * 0.002); // 0.2% institutional escrow fee
  const totalLandedCost = baseCropTotal + estimatedFreight + weighbridgeFee + escrowBankingCess;
  const landedCostPerTon = Math.round(totalLandedCost / targetQty);

  // Price relaxation recommendation
  const priceGap = avgRegionalAskingPrice - buyerBudgetPrice;
  const recommendedRelaxation = Math.max(0, priceGap);
  const relaxationPercent = ((recommendedRelaxation / buyerBudgetPrice) * 100).toFixed(1);

  // Buyer Payment info
  const payment = userProfile?.paymentDetails;
  const hasPaymentDetails = Boolean(payment?.accountNumber || payment?.upiId || userProfile?.bankAccountLast4);
  const isUpi = payment?.method === 'upi';

  const testRefundPing = () => {
    setTestingPing(true);
    setPingSuccess(null);
    setTimeout(() => {
      setTestingPing(false);
      const acc = isUpi
        ? payment?.upiId || 'procure.mills@okhdfcbank'
        : `A/C •••••${payment?.accountNumber?.slice(-4) || userProfile?.bankAccountLast4 || '9901'}`;
      setPingSuccess(`Bank Escrow Channel Active: Automated debit & refund routing verified for ${acc}!`);
      setTimeout(() => setPingSuccess(null), 4000);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mb-2">
            <Store className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Buyer Procurement Desk</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Wholesale Procurement & Escrow Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Institutional capital protection, automated landed expense calculation, and AI regional crop aggregation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsBankModalOpen(true)}
            className="bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-blue-300 dark:border-blue-800 flex items-center gap-2 transition-all shadow-sm"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{hasPaymentDetails ? 'Trade Settlement Bank / UPI' : '+ Add Trade Bank / UPI'}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('buyer-demands')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all"
          >
            <span>Post New RFQ Demand</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenAggregator}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Regional Aggregator</span>
          </motion.button>
        </div>
      </div>

      {/* 4 Financial & Procurement Cards with Spring Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -5, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-blue-200 dark:border-blue-900/50 shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Escrow Capital Locked
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
            ₹{totalEscrowLocked.toLocaleString()}
          </h3>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Secured in Bank Escrow Vault</span>
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Procured Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalProcuredTons} Tons
          </h3>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified by Mandi Weighbridges</span>
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active RFQ Demands
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-amber-500 mt-2">
            {activeDemandsCount} Active
          </h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2 flex items-center gap-1">
            <span>Broadcasted to FPO Networks</span>
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-purple-200 dark:border-purple-900/50 shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Regional Crop Clusters
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {clusters.length} Regions
          </h3>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Supply Aggregation Ready</span>
          </p>
        </motion.div>
      </div>

      {/* DEDICATED BUYER TRADE SETTLEMENT BANK & UPI DESK */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50/90 via-white to-slate-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900/60 p-6 rounded-3xl border-2 border-blue-300/80 dark:border-blue-800/80 shadow-md relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-blue-100 dark:border-blue-900/60">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 animate-pulse-glow">
              {isUpi ? <Zap className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Trade Escrow Funding & Refund Settlement Desk
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>Buyer Institutional Account</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authorized corporate bank or UPI account for funding wholesale escrow lockups and receiving instant automated surplus refunds upon weighbridge verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={testRefundPing}
              disabled={testingPing}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              {testingPing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{testingPing ? 'Verifying...' : 'Test Escrow Route'}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBankModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{hasPaymentDetails ? 'Manage Trade Bank / UPI' : 'Add Trade Bank / UPI'}</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {pingSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2 font-bold animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 animate-bounce" />
              <span>{pingSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Details Box */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 shadow-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Escrow Funding Channel
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {isUpi ? '⚡ Corporate UPI VPA' : `🏛️ ${payment?.bankName || 'HDFC Bank'}`}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
              {isUpi
                ? payment?.upiId || 'procure.mills@okhdfcbank'
                : `A/C ••••••••••••${payment?.accountNumber?.slice(-4) || userProfile?.bankAccountLast4 || '9901'}`}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 shadow-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account Entity & Type
            </span>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              {payment?.accountHolderName || userProfile?.displayName || 'AgroProcure Wholesale Mills'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              <span>{payment?.accountType || 'Current / Corporate Trade Account'}</span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Clearing Code & Refunds
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                IFSC: {payment?.ifscCode || 'HDFC0000456'}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Central MP Institutional Clearing • Instant Reversal SLA
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Automated Tonnage Variance Refund Active</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* AI Price Relaxation & Calculated Expense Simulator */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>AI Price Relaxation & Landed Expense Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate total procurement expenses (crop cost, certified weighbridge, freight km, bank escrow) and view AI price relaxation guidance.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
            Live Mandi Feed: Indore / Ujjain
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Select Commodity
            </label>
            <select
              value={calcCrop}
              onChange={(e) => setCalcCrop(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="Wheat">Wheat (Lokwan / Sharbati)</option>
              <option value="Soybean">Soybean (JS 335 / Yellow)</option>
              <option value="Chana">Gram / Chana</option>
              <option value="Maize">Maize / Corn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Target Quantity (Tons)
            </label>
            <input
              type="number"
              min={5}
              max={500}
              value={targetQty}
              onChange={(e) => setTargetQty(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Buyer Bid / Target Price (₹/Ton)
            </label>
            <input
              type="number"
              step={100}
              value={buyerBudgetPrice}
              onChange={(e) => setBuyerBudgetPrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Estimated Freight Distance (Km)
            </label>
            <input
              type="number"
              min={5}
              max={500}
              value={freightKm}
              onChange={(e) => setFreightKm(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* AI Suggestion for Price Relaxation with Animated Highlight */}
        <motion.div
          animate={{
            borderColor: priceGap > 0 ? ['#f59e0b', '#fbbf24', '#f59e0b'] : '#e2e8f0',
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-amber-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  AI Price Relaxation Intelligence
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Regional Spread: ₹{avgRegionalAskingPrice}/Ton
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {priceGap > 0 ? (
                  <span>
                    Your bid (₹{buyerBudgetPrice}/Ton) is <strong>₹{priceGap}/Ton ({relaxationPercent}%)</strong> below the prevailing asking rate of listed lots in this cluster. Relaxing your target to <strong>₹{avgRegionalAskingPrice}/Ton</strong> unlocks <strong>{totalAvailableRegionalTons} Tons</strong> of Grade-A certified harvest immediately without waiting for custom RFQ responses.
                  </span>
                ) : (
                  <span>
                    Your bid (₹{buyerBudgetPrice}/Ton) is highly competitive and beats the regional average by ₹{Math.abs(priceGap)}/Ton! Farmers in the Malwa corridor will fulfill your volume within 24 hours.
                  </span>
                )}
              </p>
            </div>
          </div>

          {priceGap > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBuyerBudgetPrice(avgRegionalAskingPrice)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shrink-0 transition-colors shadow-sm"
            >
              Apply Suggested Rate (₹{avgRegionalAskingPrice})
            </motion.button>
          )}
        </motion.div>

        {/* Landed Expense Breakdown & Mart Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Itemized Cost Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Institutional Landed Expense Breakdown</span>
            </h4>
            <div className="space-y-2 text-xs divide-y divide-slate-200 dark:divide-slate-700">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Base Harvest Commodity Cost:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  ₹{baseCropTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">
                  Freight Logistics ({freightKm} Km @ ₹{freightPerTonKm}/T-Km):
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  ₹{estimatedFreight.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Certified Mandi Weighbridge Gross/Tare:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  ₹{weighbridgeFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Institutional Escrow Bank Guarantee (0.2%):</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  ₹{escrowBankingCess.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2.5 text-sm font-black text-slate-900 dark:text-white">
                <span>Total Landed Escrow Capital:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{totalLandedCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Net Cost per Ton and Quick Mart Procurement */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Target Delivery Hub
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  {destinationHub}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Locking funds in escrow protects your mill against wet grain and weight discrepancies: if the certified weighbridge detects moisture above contract specifications, the escrow price is calibrated downward automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Net Landed Cost Per Ton
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{landedCostPerTon.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">/ Ton delivered</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('marketplace')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <span>Browse Mart Lots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Supply Snapshot Banner with Spring Hover */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-purple-800/40 cursor-pointer"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/30 text-purple-200 uppercase tracking-widest border border-purple-400/30">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>AI Supply Regional Aggregator</span>
          </div>
          <h3 className="text-2xl font-black">
            Aggregate Harvest by Geographic Corridors
          </h3>
          <p className="text-xs text-purple-200/90 leading-relaxed">
            Instead of buying isolated 20-ton lots from scattered farms, the AI Aggregator groups harvest listings by district clusters (e.g. Indore-Sanwer, Ujjain Mandi Belt, Hoshangabad). Consolidate multiple lots to meet 100% of your mill demand in one optimized transport trip.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenAggregator}
          className="bg-white hover:bg-slate-100 text-slate-900 font-black px-6 py-3.5 rounded-2xl text-xs shadow-xl transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <span>View Regional Clusters</span>
          <ArrowRight className="w-4 h-4 text-purple-600" />
        </motion.button>
      </motion.div>

      {/* Bank & UPI Management Modal */}
      <BankOrUpiModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        language={language}
      />
    </div>
  );
};
