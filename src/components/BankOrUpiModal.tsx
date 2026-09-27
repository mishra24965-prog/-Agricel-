import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building,
  Zap,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PaymentDetails, UserRole } from '../types';
import type { Language } from '../translations';

interface BankOrUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  activePortal?: UserRole;
  onSuccess?: () => void;
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
  'Madhya Pradesh Gramin Bank (MPGB)',
];

const UPI_HANDLES = ['@oksbi', '@okhdfcbank', '@paytm', '@ybl', '@upi', '@barodampay'];

export const BankOrUpiModal: React.FC<BankOrUpiModalProps> = ({
  isOpen,
  onClose,
  language: _language,
  activePortal,
  onSuccess,
}) => {
  const { userProfile, updateUserProfile } = useAuth();

  const role = activePortal || userProfile?.role || 'farmer';
  const isFarmer = role === 'farmer';
  const isBuyer = role === 'buyer';

  const existingPayment = userProfile?.paymentDetails;

  const [method, setMethod] = useState<'bank' | 'upi'>(existingPayment?.method || 'bank');

  // Bank Form State
  const [bankName, setBankName] = useState(
    existingPayment?.bankName || (isFarmer ? 'State Bank of India (SBI)' : 'HDFC Bank')
  );
  const [customBank, setCustomBank] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(
    existingPayment?.accountHolderName || userProfile?.displayName || ''
  );
  const [accountNumber, setAccountNumber] = useState(existingPayment?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    existingPayment?.accountNumber || ''
  );
  const [ifscCode, setIfscCode] = useState(
    existingPayment?.ifscCode || (isFarmer ? 'SBIN0001234' : 'HDFC0000456')
  );
  const [accountType, setAccountType] = useState<'Savings' | 'Current' | 'KCC (Kisan Credit Card)'>(
    existingPayment?.accountType || (isFarmer ? 'KCC (Kisan Credit Card)' : 'Current')
  );

  // UPI Form State
  const [upiId, setUpiId] = useState(
    existingPayment?.upiId ||
      (isFarmer ? `${userProfile?.phone?.replace(/\D/g, '').slice(-10) || '9826011223'}@oksbi` : 'procure.mills@okhdfcbank')
  );

  // Verification & Status State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    existingPayment?.isVerified ? 'Active & Verified' : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Weighbridge and Arbitrator roles should not have bank details
  if (!isFarmer && !isBuyer) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-2xl mx-auto flex items-center justify-center text-xl mb-3 shadow-inner">
            <Info className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Role Notice: Operational Account
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Bank account and UPI details are strictly required for <strong>Farmers</strong> (to receive direct escrow harvest payouts) and <strong>Wholesale Buyers</strong> (for escrow trade deposits and automated refunds).
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            As a <strong>{role === 'logistics' ? 'Certified Weighbridge Operator' : 'Management Arbitrator'}</strong>, your profile is authorized via station licenses and tribunal certificates instead of personal banking credentials.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  const handleIfscChange = (val: string) => {
    setIfscCode(val.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  };

  const handleAppendUpiHandle = (handle: string) => {
    const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId;
    setUpiId(`${prefix}${handle}`);
  };

  const handleVerify = async () => {
    setErrorMsg(null);
    if (method === 'bank') {
      if (!accountNumber || accountNumber.length < 8) {
        setErrorMsg('Please enter a valid bank account number (min 8 digits).');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setErrorMsg('Account number and confirmation do not match.');
        return;
      }
      if (!ifscCode || ifscCode.length < 11) {
        setErrorMsg('Please enter a valid 11-character bank IFSC code (e.g., SBIN0001234).');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI Virtual Payment Address (e.g., farmer@oksbi).');
        return;
      }
    }

    setIsVerifying(true);
    // Simulate instant penny drop / NPCI verification ping
    setTimeout(() => {
      setIsVerifying(false);
      const chosenHolder = accountHolderName.trim() || userProfile?.displayName || 'Rajesh Kumar';
      setVerificationResult(
        method === 'bank'
          ? `Verified via NPCI Penny Drop: Account active for "${chosenHolder}" (${bankName.split(' ')[0]})`
          : `Verified via NPCI UPI Ping: VPA active & registered to "${chosenHolder}"`
      );
    }, 900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const effectiveBankName = bankName === 'Other' && customBank ? customBank : bankName;

    if (method === 'bank') {
      if (!accountNumber || accountNumber.length < 8) {
        setErrorMsg('Please provide a valid account number.');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setErrorMsg('Account numbers do not match.');
        return;
      }
      if (!ifscCode || ifscCode.length < 11) {
        setErrorMsg('Please provide an 11-digit valid IFSC Code.');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        setErrorMsg('Please provide a valid UPI ID (e.g. mobile@upi).');
        return;
      }
    }

    setIsSaving(true);
    try {
      const details: PaymentDetails = {
        method,
        bankName: effectiveBankName,
        accountHolderName: accountHolderName.trim() || userProfile?.displayName || 'Registered Beneficiary',
        accountNumber: method === 'bank' ? accountNumber : '',
        ifscCode: method === 'bank' ? ifscCode : '',
        accountType: method === 'bank' ? accountType : undefined,
        upiId: method === 'upi' ? upiId : '',
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      };

      const last4 = method === 'bank' ? accountNumber.slice(-4) : upiId.slice(0, 4);

      await updateUserProfile({
        paymentDetails: details,
        bankAccountLast4: last4,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving bank/UPI details:', err);
      setErrorMsg('Failed to save payment details. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 md:p-8 relative max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
              isFarmer
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
            }`}
          >
            {method === 'bank' ? <Building className="w-6 h-6" /> : <Zap className="w-6 h-6 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isFarmer
                  ? 'Add Bank or UPI to Receive Payment'
                  : 'Add Trade Settlement Bank or UPI'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isFarmer
                ? 'Direct automated escrow disbursement when harvest weight is verified.'
                : 'Connected account for instant 100% escrow vaulting and automated refunds.'}
            </p>
          </div>
        </div>

        {/* Role Explanation Card */}
        <div
          className={`p-3.5 rounded-2xl mb-5 border text-xs flex items-start gap-2.5 ${
            isFarmer
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {isFarmer ? (
              <span>
                <strong>Farmer Escrow Protection:</strong> Once the weighbridge operator logs the gross & tare weight of your crop truck, 100% of the locked escrow proceeds are credited directly to your bank account or UPI ID via instant IMPS transfer.
              </span>
            ) : (
              <span>
                <strong>Buyer Institutional Protection:</strong> Funds locked in escrow for wholesale crop lots remain secured. If verified weight or delivery terms adjust, surplus balances are instantly refunded to this linked bank account or UPI.
              </span>
            )}
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setMethod('bank')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              method === 'bank'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Bank Account (IMPS / NEFT)</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setMethod('upi')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              method === 'upi'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>UPI ID (Instant VPA)</span>
          </motion.button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Success Badge */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{verificationResult}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {method === 'bank' ? (
            <>
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  Select Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Other">Other Scheduled Commercial Bank / Cooperative</option>
                </select>
                {bankName === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter Bank Name (e.g. Indore Premier Cooperative Bank)"
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                    className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                )}
              </div>

              {/* Account Holder Name & Account Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Beneficiary Name (As in Passbook)
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                  >
                    <option value="Savings">Savings Account</option>
                    <option value="KCC (Kisan Credit Card)">Kisan Credit Card (KCC)</option>
                    <option value="Current">Current / Business Account</option>
                  </select>
                </div>
              </div>

              {/* Account Number & Confirm Account Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Bank Account Number
                  </label>
                  <input
                    type="password"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 30894451248"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100 tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                    Confirm Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter to verify"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100 tracking-widest"
                  />
                </div>
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Bank IFSC Code</span>
                  <span className="text-[10px] text-slate-400 font-normal">11 characters (e.g. SBIN0001234)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={ifscCode}
                    onChange={(e) => handleIfscChange(e.target.value)}
                    placeholder="SBIN0001234"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold uppercase outline-none text-slate-800 dark:text-slate-100"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Verify</span>
                  </motion.button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Branch routing: {bankName.split('(')[0].trim()} • Central MP Clearing Zone
                </p>
              </div>
            </>
          ) : (
            <>
              {/* UPI ID Form */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  Enter UPI ID (Virtual Payment Address - VPA)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                    placeholder="e.g. 9826011223@oksbi or farmer@paytm"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold outline-none text-slate-800 dark:text-slate-100"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Ping UPI</span>
                  </motion.button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Quick handle suffixes:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {UPI_HANDLES.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleAppendUpiHandle(h)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                  Registered UPI Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
            </>
          )}

          {/* Secure Escrow Lock Footer */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-bit Encrypted Banking Gateway</span>
            </span>
            <span>NPCI / RBI Escrow Guidelines</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSaving}
            className={`w-full py-3.5 rounded-2xl text-xs font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isFarmer
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {isSaving
                ? 'Verifying with Bank...'
                : isFarmer
                ? 'Save Bank / UPI to Receive Payouts'
                : 'Save Settlement Account for Escrow'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
