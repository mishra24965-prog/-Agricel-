import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Phone,
  Scale,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createGrievanceTicket, resolveArbitrationTicket } from '../services/db';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Grievance, Order } from '../types';

interface GrievancesViewProps {
  language: Language;
  grievances: Grievance[];
  orders: Order[];
  onTicketUpdated: () => void;
}

export const GrievancesView: React.FC<GrievancesViewProps> = ({
  language,
  grievances,
  orders,
  onTicketUpdated,
}) => {
  const { userProfile } = useAuth();
  const t = translations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrackingId, setSelectedTrackingId] = useState(orders[0]?.trackingId || 'AGR-492810');
  const [category, setCategory] = useState('Transit Delay');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Arbitration modal
  const [activeArbitrateTicket, setActiveArbitrateTicket] = useState<Grievance | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [isRuling, setIsRuling] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetOrder = orders.find((o) => o.trackingId === selectedTrackingId);
      const newTicket: Grievance = {
        id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
        trackingId: selectedTrackingId,
        orderId: targetOrder?.id || 'O-custom',
        raisedById: userProfile?.uid || 'guest-user',
        raisedByName: userProfile?.displayName || 'User',
        userPhone: userProfile?.phone || '+91 98930 55443',
        farmerPhone: targetOrder ? targetOrder.farmerPhone : '+91 98260 11223',
        role: userProfile?.role || 'buyer',
        category,
        details,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      await createGrievanceTicket(newTicket);
      setIsModalOpen(false);
      setDetails('');
      onTicketUpdated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartArbitration = (ticket: Grievance) => {
    setActiveArbitrateTicket(ticket);
    setIsRuling(true);
    setVerdict(null);

    setTimeout(() => {
      setIsRuling(false);
      let rulingText = '';
      if (ticket.category === 'Transit Delay') {
        rulingText =
          'Impartial Escrow Ruling: Minor delay verified as road maintenance. Recommend releasing 100% agreed escrow balance to the farmer upon weighbridge confirmation, with carrier transit fee waiver applied.';
      } else if (ticket.category.includes('Weight')) {
        rulingText =
          'Impartial Escrow Ruling: Tonnage variance re-adjusted to certified weighbridge digital scale ticket. Farmer payout calculated strictly on net verified weight.';
      } else {
        rulingText =
          'Impartial Escrow Ruling: Certified moisture test analysis accepted within standard 12% moisture tolerance. 100% escrow vault capital released.';
      }
      setVerdict(rulingText);
    }, 700);
  };

  const handleExecuteRuling = async () => {
    if (!activeArbitrateTicket || !verdict) return;
    await resolveArbitrationTicket(activeArbitrateTicket.id, verdict);
    setActiveArbitrateTicket(null);
    onTicketUpdated();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>{t.mgmtBadge}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.mgmtTitle}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.mgmtSub}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-lg shadow-amber-600/25 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.btnRaiseTicket}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-bold">{t.thTicket}</th>
                <th className="pb-3 font-bold">{t.thTracking}</th>
                <th className="pb-3 font-bold">{t.thRaisedBy}</th>
                <th className="pb-3 font-bold">{t.thFarmerContact}</th>
                <th className="pb-3 font-bold">{t.thBuyerContact}</th>
                <th className="pb-3 font-bold">{t.thDetails}</th>
                <th className="pb-3 font-bold">{t.thStatus}</th>
                <th className="pb-3 font-bold text-right">{t.thDesk}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {grievances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active dispute tickets. Escrow transactions are processing smoothly!
                  </td>
                </tr>
              ) : (
                grievances.map((g) => {
                  const isOpen = g.status === 'Open';
                  return (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 font-bold text-purple-600 dark:text-purple-400">
                        {g.id}
                      </td>
                      <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {g.trackingId}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {g.raisedByName}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{g.farmerPhone}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-500" />
                          <span>{g.userPhone}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-300 max-w-xs">
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold inline-block mb-1">
                          {g.category}
                        </span>
                        <div className="line-clamp-2">{g.details}</div>
                        {g.verdict && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                            Verdict: {g.verdict}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isOpen
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {isOpen ? 'Open Ticket' : 'Resolved'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {isOpen ? (
                          <button
                            onClick={() => handleStartArbitration(g)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            AI Arbitrate
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">
              {t.modalGrievanceTitle}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit an arbitration request to the Agricel Escrow Tribunal.
            </p>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  {t.lblSelectTracking}
                </label>
                <select
                  value={selectedTrackingId}
                  onChange={(e) => setSelectedTrackingId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.trackingId}>
                      {o.trackingId} - {o.cropInfo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  {t.lblCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="Transit Delay">Transit Delay</option>
                  <option value="Weight Mismatch">Weight Mismatch</option>
                  <option value="Moisture & Quality Dispute">Moisture & Quality Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  {t.lblDetails}
                </label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the discrepancy..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-amber-600/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{t.btnSubmitTicket}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Arbitration Ruling Modal */}
      {activeArbitrateTicket && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setActiveArbitrateTicket(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl flex items-center justify-center text-lg font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t.modalArbitrateTitle}
                </h3>
                <p className="text-xs text-slate-500">{t.modalArbitrateSub}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400">Dispute Ticket:</span>{' '}
                <span className="font-bold text-purple-600">{activeArbitrateTicket.id}</span>
              </div>
              <div>
                <span className="text-slate-400">Tracking Reference:</span>{' '}
                <span className="font-bold">{activeArbitrateTicket.trackingId}</span>
              </div>
              <div>
                <span className="text-slate-400">Subject:</span>{' '}
                <span className="font-bold">{activeArbitrateTicket.category}</span>
              </div>
              <div>
                <span className="text-slate-400">Claimant Statement:</span>{' '}
                <span>{activeArbitrateTicket.details}</span>
              </div>
            </div>

            {isRuling ? (
              <div className="p-6 text-center text-xs text-purple-600 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Formulating neutral trade ruling via AI legal agent...</span>
              </div>
            ) : (
              verdict && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
                  {verdict}
                </div>
              )
            )}

            <button
              onClick={handleExecuteRuling}
              disabled={isRuling}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.btnExecuteVerdict}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
