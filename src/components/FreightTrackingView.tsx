import React, { useState } from 'react';
import { Truck, Search, MapPin, CheckCircle2, Clock, ShieldCheck, Phone } from 'lucide-react';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Order } from '../types';

interface FreightTrackingViewProps {
  language: Language;
  orders: Order[];
  prefilledTrackingId?: string;
}

export const FreightTrackingView: React.FC<FreightTrackingViewProps> = ({
  language,
  orders,
  prefilledTrackingId = '',
}) => {
  const t = translations[language];

  const [searchId, setSearchId] = useState(prefilledTrackingId);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(
    prefilledTrackingId ? orders.find((o) => o.trackingId === prefilledTrackingId) || null : null
  );
  const [hasSearched, setHasSearched] = useState(Boolean(prefilledTrackingId));

  const handleSearch = () => {
    const query = searchId.trim().toUpperCase();
    const found = orders.find((o) => o.trackingId.toUpperCase() === query);
    setTrackedOrder(found || null);
    setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mb-2">
          <Truck className="w-3.5 h-3.5 text-blue-500" />
          <span>{t.freightBadge}</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t.freightTitle}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.freightSub}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. AGR-492810"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none uppercase text-xs font-black text-slate-800 dark:text-slate-100 focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t.btnTrack}</span>
          </button>
        </div>

        {hasSearched && (
          <div>
            {trackedOrder ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Active Telemetry Record
                    </span>
                    <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">
                      {trackedOrder.trackingId}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto ${
                      trackedOrder.status === 'In Transit / Verified' || trackedOrder.status === 'Settled'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {trackedOrder.status === 'In Transit / Verified' || trackedOrder.status === 'Settled' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{trackedOrder.status}</span>
                  </span>
                </div>

                {/* 3 Step Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">1. Capital Escrow Locked</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">100% funds held in bank vault</p>
                      <span className="text-[10px] font-bold text-emerald-600">
                        ₹{((trackedOrder.qty || 20) * trackedOrder.pricePerTon).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">2. Weighbridge Sign-Off</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {trackedOrder.verifiedWeight
                          ? `Weighed: ${trackedOrder.verifiedWeight} Tons`
                          : 'Awaiting weigh-in at pickup'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">3. Direct Farmer Payout</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {trackedOrder.status === 'In Transit / Verified'
                          ? 'Transferred to farmer account'
                          : 'Pending weighbridge sign-off'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Crop Commodity:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {trackedOrder.cropInfo}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Farmer:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{trackedOrder.farmerName} ({trackedOrder.farmerPhone})</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Buyer:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{trackedOrder.buyerName} ({trackedOrder.buyerPhone})</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Transit Origin:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{trackedOrder.origin}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300">
                Tracking ID &quot;{searchId}&quot; not found in current ledger. Please verify the code (e.g. AGR-492810).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
