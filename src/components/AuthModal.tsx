import React, { useState } from 'react';
import {
  X,
  Sprout,
  Tractor,
  Store,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Zap,
  CreditCard,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { UserRole } from '../types';

interface AuthModalProps {
  language: Language;
}

const COMMON_BANKS = [
  'State Bank of India (SBI)',
  'Punjab National Bank (PNB)',
  'Bank of Baroda (BOB)',
  'HDFC Bank',
  'ICICI Bank',
  'Canara Bank',
  'Union Bank of India',
  'Axis Bank',
];

export const AuthModal: React.FC<AuthModalProps> = ({ language }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogleAuth,
    signInDemoUser,
    userProfile,
  } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'profile' | 'quick'>('profile');
  const [name, setName] = useState(userProfile?.displayName || 'Rajesh Kumar (Malwa FPO)');
  const [phone, setPhone] = useState(userProfile?.phone || '+91 98260 11223');
  const [role, setRole] = useState<UserRole>(userProfile?.role || 'farmer');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Bank & UPI onboarding for Farmer & Buyer
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank');
  const [bankAccount, setBankAccount] = useState('308944514821');
  const [ifsc, setIfsc] = useState('SBIN0001234');
  const [upiVpa, setUpiVpa] = useState('9826011223@oksbi');

  if (!isAuthModalOpen) return null;

  const isFarmer = role === 'farmer';
  const isBuyer = role === 'buyer';
  const isWeighbridge = role === 'logistics';
  const isArbitrator = role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      const paymentValue = paymentMethod === 'bank' ? bankAccount : upiVpa;
      await signInDemoUser(role, name, phone, paymentMethod, paymentValue, ifsc);
      closeAuthModal();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleClick = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogleAuth();
    } finally {
      setIsSigningIn(false);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'farmer',
      title: 'Farmer FPO / Producer',
      desc: 'List harvest, calibrate Mandi prices via AI, receive automated bank payouts.',
      icon: <Tractor className="w-5 h-5 text-emerald-600" />,
    },
    {
      role: 'buyer',
      title: 'Wholesale Buyer / Mill',
      desc: 'Lock 100% escrow capital in bank vault, broadcast RFQ demands.',
      icon: <Store className="w-5 h-5 text-amber-500" />,
    },
    {
      role: 'logistics',
      title: 'Weighbridge Operator',
      desc: 'Inspect truck tare/gross weight and release automated escrow funds.',
      icon: <Scale className="w-5 h-5 text-purple-500" />,
    },
    {
      role: 'admin',
      title: 'Management Arbitrator',
      desc: 'Mediate trade disputes and enforce neutral AI-guided rulings.',
      icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 md:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-xl mb-2 shadow-inner">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.authTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized Escrow Profile with Real-Time Cloud Sync
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Custom Profile Setup
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Quick Role Switcher
          </button>
        </div>

        {/* Google One-Click Auth */}
        <button
          onClick={handleGoogleClick}
          disabled={isSigningIn}
          className="w-full mb-5 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{isSigningIn ? 'Connecting...' : t.signInWithGoogle}</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] font-extrabold uppercase text-slate-400">
            or configure profile
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                {t.authName}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100 focus:border-emerald-500"
                placeholder="e.g. Rajesh Kumar (Malwa FPO)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                {t.authPhone}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100 focus:border-emerald-500"
                placeholder="+91 98260 11223"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400">
                {t.authRole}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setRole(item.role);
                      if (item.role === 'farmer') {
                        setBankAccount('308944514821');
                        setIfsc('SBIN0001234');
                        setUpiVpa('9826011223@oksbi');
                      } else if (item.role === 'buyer') {
                        setBankAccount('50200049219901');
                        setIfsc('HDFC0000456');
                        setUpiVpa('procure.mills@okhdfcbank');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      role === item.role
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CONDITIONAL BANK / UPI SETUP: ONLY FOR FARMER & BUYER */}
            {isFarmer || isBuyer ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isFarmer
                        ? 'Bank or UPI to Receive Harvest Payment'
                        : 'Trade Settlement Bank or UPI (Escrow & Refunds)'}
                    </span>
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Required for Payouts
                  </span>
                </div>

                <div className="flex gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'bank'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Building className="w-3 h-3" />
                    <span>Bank Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'upi'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>UPI ID</span>
                  </button>
                </div>

                {paymentMethod === 'bank' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="IFSC (e.g. SBIN0001234)"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. 9826011223@oksbi or farmer@paytm"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value.trim().toLowerCase())}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                )}
              </div>
            ) : isWeighbridge ? (
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2">
                <Scale className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Station Operational Terminal:</strong> Authorized via MP Mandi Board License <code>WB-MP-IND-04</code>. Personal bank details are not required.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Dispute Arbitration Desk:</strong> Accredited via Agricultural Tribunal Registry <code>ARB-MP-2026-88</code>. Personal bank details are not required.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSigningIn ? 'Saving...' : t.btnLoginEnter}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instantly switch into any role to test direct trade workflows:
            </p>
            {rolesList.map((item) => (
              <button
                key={item.role}
                onClick={() => {
                  signInDemoUser(item.role);
                  closeAuthModal();
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                  Launch &rarr;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
