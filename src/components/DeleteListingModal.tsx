import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, ShieldAlert, Wheat, MapPin, IndianRupee } from 'lucide-react';
import type { Language } from '../translations';
import type { Listing } from '../types';

interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listing: Listing | null;
  language: Language;
  isDeleting?: boolean;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  listing,
  language,
  isDeleting = false,
}) => {
  if (!isOpen || !listing) return null;

  const isHindi = language === 'hi' || language === 'bho';
  const isEscrowLocked = listing.status === 'Escrow Locked';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 md:p-7 border border-rose-200 dark:border-rose-900/60 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top red glow bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-start gap-4 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{isHindi ? 'फसल हटाने की पुष्टि' : 'Confirm Listing Deletion'}</span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                {isHindi ? 'क्या आप इस फसल को मंडी से हटाना चाहते हैं?' : 'Remove Crop from Wholesale Mart?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi
                  ? 'हटाने के बाद यह फसल थोक मंडी से तुरंत हटा दी जाएगी और खरीदार इस पर ऑर्डर नहीं दे सकेंगे।'
                  : 'Deleting this lot will immediately unlist it from the Wholesale Mart. Millers and buyers will no longer be able to place orders.'}
              </p>
            </div>
          </div>

          {/* Crop Lot Card Details */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-3.5">
              {listing.photoUrl ? (
                <img
                  src={listing.photoUrl}
                  alt={listing.crop}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                  <Wheat className="w-7 h-7" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {listing.crop} • {listing.variety}
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                    {listing.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                    {listing.qty} Tons Lot
                  </span>
                  <span>•</span>
                  <span>₹{listing.price.toLocaleString()} / Ton</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{listing.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {isHindi ? 'कुल अनुमानित मूल्य:' : 'Total Lot Value:'}
              </span>
              <span className="font-black text-slate-900 dark:text-white text-sm">
                ₹{(listing.qty * listing.price).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Escrow Locked Warning or Safe Deletion Notice */}
          {isEscrowLocked ? (
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black">
                  {isHindi ? 'फसल एस्क्रो में लॉक है!' : 'Crop Lot is Escrow Locked!'}
                </p>
                <p className="text-[11px] mt-0.5 leading-snug">
                  {isHindi
                    ? 'यह फसल वर्तमान में एक सक्रिय खरीद सौदे में लॉक है। तौल और भुगतान पूर्ण होने या विवाद निवारण से पहले इसे हटाया नहीं जा सकता।'
                    : 'This crop is tied to an active Escrow trade contract awaiting weighbridge clearance. It cannot be deleted until the transaction finishes or is resolved.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  {isHindi
                    ? 'शून्य जुर्माना: अनबिके लॉट को हटाने पर कोई शुल्क या कटौती नहीं है।'
                    : 'Zero Penalty: No fee or penalty applies to cancel or unlist unsold crop lots.'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>
                  {isHindi
                    ? 'आप कभी भी नई फसल पुनः सूचीबद्ध कर सकते हैं।'
                    : 'You can publish new or updated harvest lots anytime.'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              onClick={onConfirm}
              disabled={isDeleting || isEscrowLocked}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md flex items-center gap-2 transition-all ${
                isEscrowLocked
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {isDeleting
                  ? isHindi
                    ? 'हटाया जा रहा है...'
                    : 'Deleting...'
                  : isHindi
                  ? 'हाँ, फसल लॉट हटाएं'
                  : 'Yes, Delete Crop Lot'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
