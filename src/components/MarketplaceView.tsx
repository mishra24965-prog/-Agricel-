import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  ShieldCheck,
  MapPin,
  Phone,
  Lock,
  X,
  Wheat,
  CheckCircle2,
  Camera,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createEscrowOrder, updateCropListingStatus } from '../services/db';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Listing, Order, QualityAssessment } from '../types';

interface MarketplaceViewProps {
  language: Language;
  listings: Listing[];
  onOrderCreated: (trackingId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  language,
  listings,
  onOrderCreated,
}) => {
  const { userProfile } = useAuth();
  const t = translations[language];

  const [filterCrop, setFilterCrop] = useState('All');
  const [activeCheckoutListing, setActiveCheckoutListing] = useState<Listing | null>(null);
  const [viewQualityModal, setViewQualityModal] = useState<{
    listing: Listing;
    quality: QualityAssessment;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableListings = listings.filter((l) => l.status === 'Available');
  const filteredListings =
    filterCrop === 'All'
      ? availableListings
      : availableListings.filter((l) => l.crop.toLowerCase().includes(filterCrop.toLowerCase()));

  const handleConfirmPurchase = async () => {
    if (!activeCheckoutListing) return;
    setIsProcessing(true);
    try {
      const trackingId = 'AGR-' + Math.floor(100000 + Math.random() * 900000);
      const totalAmount = activeCheckoutListing.qty * activeCheckoutListing.price;
      const estimatedFreight = Math.round(activeCheckoutListing.qty * 60 * 4.2); // ~60km avg

      const newOrder: Order = {
        id: 'O-' + Date.now(),
        trackingId,
        cropInfo: `${activeCheckoutListing.qty}T ${activeCheckoutListing.crop} (${activeCheckoutListing.variety})`,
        buyerId: userProfile?.uid || 'guest-buyer',
        buyerName: userProfile?.displayName || 'AgroProcure Grain Corp',
        buyerPhone: userProfile?.phone || '+91 98930 55443',
        farmerId: activeCheckoutListing.ownerId,
        farmerName: activeCheckoutListing.farmerName,
        farmerPhone: activeCheckoutListing.phone,
        qty: activeCheckoutListing.qty,
        pricePerTon: activeCheckoutListing.price,
        totalEscrow: totalAmount,
        estimatedFreight,
        landedCostPerTon: Math.round((totalAmount + estimatedFreight + 250) / activeCheckoutListing.qty),
        status: 'Awaiting Weighbridge',
        origin: activeCheckoutListing.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createEscrowOrder(newOrder);
      await updateCropListingStatus(activeCheckoutListing.id, 'Escrow Locked');

      setActiveCheckoutListing(null);
      onOrderCreated(trackingId);
    } finally {
      setIsProcessing(false);
    }
  };

  const cropCategories = ['All', 'Wheat', 'Soybean', 'Paddy', 'Mustard', 'Maize', 'Gram'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 mb-2">
            <Store className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Direct Wholesale Grain Mart</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Wholesale Grain Marketplace
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Browse verified harvest lots from regional FPOs. High-resolution grain photos and optical inspection certificates attached.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          {cropCategories.map((c) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={c}
              onClick={() => setFilterCrop(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCrop === c
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Wheat className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No active crop lots found for "{filterCrop}"
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Check other categories or post an RFQ demand to broadcast your mill's procurement requirements.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredListings.map((l) => (
            <motion.div
              key={l.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl transition-colors group cursor-pointer"
            >
              {/* Photo & Quality Badge Header */}
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {l.photoUrl ? (
                  <img
                    src={l.photoUrl}
                    alt={l.crop}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-500">
                    <Wheat className="w-12 h-12" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs px-3 py-1 rounded-full font-black shadow-md">
                    {l.crop} • {l.variety}
                  </span>
                  <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-black shadow-md">
                    ₹{l.price.toLocaleString()} / Ton
                  </span>
                </div>

                {/* Bottom Photo Pill: AI Quality Inspection */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  {l.qualityAssessment ? (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewQualityModal({
                          listing: l,
                          quality: l.qualityAssessment!,
                        });
                      }}
                      className="bg-purple-900/90 hover:bg-purple-900 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-purple-400/40 flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-300" />
                      <span>{l.qualityAssessment.grade.split(' ')[0]}</span>
                      <span className="text-purple-300">({l.qualityAssessment.score}/100)</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 text-purple-300" />
                    </motion.button>
                  ) : (
                    <span className="text-[10px] text-white/80 bg-black/40 px-2 py-1 rounded-md">
                      Standard Mandi Lot
                    </span>
                  )}

                  <span className="text-white text-xs font-black bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {l.qty} Tons
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {l.farmerName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" /> {l.phone}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {l.district || 'Indore'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-clamp-1">{l.location}</span>
                  </p>

                  {/* Quality Parameters Strip */}
                  {l.qualityAssessment && (
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-slate-100 dark:border-slate-800">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-slate-400 text-[10px] block">Moisture:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          {l.qualityAssessment.moisturePercent}% (Optimal)
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-slate-400 text-[10px] block">Foreign Matter:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          {l.qualityAssessment.foreignMatterPercent}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Escrow Math Preview */}
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs flex justify-between items-center text-slate-700 dark:text-slate-300 font-semibold">
                    <span>Total Lot Value:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{(l.qty * l.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCheckoutListing(l)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Buy via Secure Escrow</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* AI QUALITY CERTIFICATE MODAL */}
      <AnimatePresence>
        {viewQualityModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 md:p-8 border border-purple-200 dark:border-purple-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setViewQualityModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    AI Optical Grain Certificate
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspected specimen for Lot #{viewQualityModal.listing.id} • {viewQualityModal.listing.crop}
                  </p>
                </div>
              </div>

              {/* Photo preview */}
              {viewQualityModal.listing.photoUrl && (
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700">
                  <img
                    src={viewQualityModal.listing.photoUrl}
                    alt="Inspected Specimen"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                    Verified Purity: {viewQualityModal.quality.score}/100
                  </div>
                </div>
              )}

              {/* Grade Header */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Classified Grade:</span>
                  <div className="text-sm font-black text-purple-700 dark:text-purple-300">
                    {viewQualityModal.quality.grade}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Standard:</span>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    AGMARK Standard
                  </div>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Moisture Reading:</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {viewQualityModal.quality.moisturePercent}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Foreign Dockage:</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {viewQualityModal.quality.foreignMatterPercent}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Broken Grains:</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {viewQualityModal.quality.brokenGrainsPercent}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Surface Luster:</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {viewQualityModal.quality.luster}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                {viewQualityModal.quality.notes}
              </p>

              <button
                onClick={() => setViewQualityModal(null)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl text-xs transition-colors"
              >
                Close Inspection Certificate
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PURCHASE / ESCROW LOCK CONFIRMATION MODAL */}
      <AnimatePresence>
        {activeCheckoutListing && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveCheckoutListing(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {t.modalEscrowTitle}
                  </h3>
                  <p className="text-xs text-slate-500">100% Capital Protection in Bank Vault</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                {t.modalEscrowSub}
              </p>

              <div className="text-xs mb-6 space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop Commodity:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeCheckoutListing.crop} ({activeCheckoutListing.variety})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeCheckoutListing.qty} Tons
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rate:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{activeCheckoutListing.price.toLocaleString()} / Ton
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeCheckoutListing.farmerName}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3 text-sm font-black text-emerald-600 dark:text-emerald-400">
                  <span>Total Escrow Capital Vault Lock:</span>
                  <span>
                    ₹{(activeCheckoutListing.qty * activeCheckoutListing.price).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Securing Capital in Escrow...' : 'Confirm Escrow Lock'}</span>
                </motion.button>
                <button
                  onClick={() => setActiveCheckoutListing(null)}
                  className="w-full text-slate-500 font-bold py-2 text-xs hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
