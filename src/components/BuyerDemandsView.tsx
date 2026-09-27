import React, { useState } from 'react';
import { Megaphone, Plus, Phone, MapPin, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBuyerDemand } from '../services/db';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Demand } from '../types';

interface BuyerDemandsViewProps {
  language: Language;
  demands: Demand[];
  onFulfill: () => void;
}

export const BuyerDemandsView: React.FC<BuyerDemandsViewProps> = ({
  language,
  demands,
  onFulfill,
}) => {
  const { userProfile } = useAuth();
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState(userProfile?.displayName || 'AgroProcure Grain Corp');
  const [phone, setPhone] = useState(userProfile?.phone || '+91 98930 55443');
  const [crop, setCrop] = useState('Wheat');
  const [variety, setVariety] = useState('Lokwan');
  const [qty, setQty] = useState(50);
  const [price, setPrice] = useState(26200);
  const [location, setLocation] = useState('Indore Warehouse Complex, MP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newDemand: Demand = {
        id: 'D-' + Date.now(),
        buyerId: userProfile?.uid || 'guest-buyer',
        buyerName,
        buyerPhone: phone,
        crop,
        variety,
        qty: Number(qty),
        price: Number(price),
        location,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      await createBuyerDemand(newDemand);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mb-2">
            <Megaphone className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.demandsBadge}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.demandsTitle}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.demandsSub}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t.btnPostDemand}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demands.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-blue-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 uppercase">
                  {d.crop}
                </span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  Target: ₹{(d.price ?? d.targetPrice ?? 25000).toLocaleString()} / Ton
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {d.buyerName}
              </h3>
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-500" /> {d.buyerPhone || d.phone || '+91 98930 55443'}
              </p>
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {d.location || d.destination || 'Indore'}
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Tonnage:</span>
                  <span className="font-extrabold text-blue-600">{d.qty ?? d.qtyNeeded ?? 50} Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Variety:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{d.variety}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onFulfill}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md shadow-blue-600/20"
            >
              Fulfill Demand (List Harvest)
            </button>
          </div>
        ))}
      </div>

      {/* Post Demand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {t.modalDemandTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Direct procurement RFQ for regional farmer cooperatives.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  {t.modalBuyer}
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  {t.modalPhone}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    {t.modalCrop}
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Paddy (Dhan)">Paddy (Dhan)</option>
                    <option value="Mustard">Mustard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    {t.modalVariety}
                  </label>
                  <input
                    type="text"
                    required
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    {t.modalQty}
                  </label>
                  <input
                    type="number"
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    {t.modalTarget}
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  {t.modalDest}
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{t.btnBroadcast}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
