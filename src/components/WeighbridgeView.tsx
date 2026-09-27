import React, { useState } from 'react';
import { Scale, CheckCircle2, Phone, MapPin, X, Loader2, AlertCircle } from 'lucide-react';
import { verifyWeighbridgeAndDisburse } from '../services/db';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Order } from '../types';

interface WeighbridgeViewProps {
  language: Language;
  orders: Order[];
  onVerified: () => void;
}

export const WeighbridgeView: React.FC<WeighbridgeViewProps> = ({
  language,
  orders,
  onVerified,
}) => {
  const t = translations[language];

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [actualWeight, setActualWeight] = useState(25.0);
  const [isVerifying, setIsVerifying] = useState(false);

  const awaitingOrders = orders.filter((o) => o.status === 'Awaiting Weighbridge');

  const handleVerify = async () => {
    if (!activeOrder) return;
    setIsVerifying(true);
    try {
      await verifyWeighbridgeAndDisburse(activeOrder.id, actualWeight);
      setActiveOrder(null);
      onVerified();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 mb-2">
          <Scale className="w-3.5 h-3.5 text-purple-600" />
          <span>{t.weighBadge}</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t.weighTitle}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.weighSub}</p>
      </div>

      {awaitingOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            All current shipments are weighed and verified!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            When wholesale buyers lock escrow orders in the mart, they will appear here for tare and gross weigh-in.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awaitingOrders.map((o) => (
            <div
              key={o.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-500/50 transition-all"
            >
              <div>
                <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs px-3 py-1 rounded-full font-black">
                  Checkpoint Gate
                </span>
                <h3 className="text-xl font-black mt-3 text-slate-900 dark:text-white">
                  {o.trackingId}
                </h3>
                <p className="text-xs font-bold my-2 text-slate-700 dark:text-slate-300">
                  {o.cropInfo}
                </p>
                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Farmer: {o.farmerName} ({o.farmerPhone})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span>Buyer: {o.buyerName} ({o.buyerPhone})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>Origin: {o.origin}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveOrder(o);
                  setActualWeight(o.qty || 25.0);
                }}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>Log Weighbridge & Release Payout</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">
              {t.modalVerifyTitle}
            </h3>
            <p className="text-xs text-slate-500 mb-6">{t.modalVerifySub}</p>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking ID:</span>
                <span className="font-extrabold text-purple-600">{activeOrder.trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Declared Crop:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeOrder.cropInfo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agreed Rate:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{activeOrder.pricePerTon.toLocaleString()} / Ton
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-600 dark:text-slate-400">
                {t.lblActualWeight}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={actualWeight}
                onChange={(e) => setActualWeight(parseFloat(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none font-black text-slate-800 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  Net Payout to Farmer Bank: ₹{(actualWeight * activeOrder.pricePerTon).toLocaleString()}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isVerifying ? 'Disbursing Funds...' : t.btnVerifyDisburse}</span>
              </button>
              <button
                onClick={() => setActiveOrder(null)}
                className="w-full text-slate-500 font-bold py-2 text-xs hover:text-slate-700"
              >
                {t.btnCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
