import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Save,
  Building,
  Zap,
  CheckCircle2,
  Lock,
  Scale,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { UserRole, PaymentDetails } from '../types';

interface ProfileModalProps {
  language: Language;
  activePortal?: UserRole;
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

export const ProfileModal: React.FC<ProfileModalProps> = ({ language, activePortal }) => {
  const { userProfile, isProfileModalOpen, closeProfileModal, updateUserProfile } = useAuth();
  const t = translations[language];

  const currentRole = activePortal || userProfile?.role || 'farmer';
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [organization, setOrganization] = useState(userProfile?.organization || '');
  const [district, setDistrict] = useState(userProfile?.district || '');
  const [role, setRole] = useState<UserRole>(currentRole);

  // Payment State for Farmer and Buyer
  const existingPayment = userProfile?.paymentDetails;
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>(
    existingPayment?.method || 'bank'
  );
  const [bankName, setBankName] = useState(
    existingPayment?.bankName || (role === 'farmer' ? 'State Bank of India (SBI)' : 'HDFC Bank')
  );
  const [accountHolderName, setAccountHolderName] = useState(
    existingPayment?.accountHolderName || userProfile?.displayName || ''
  );
  const [accountNumber, setAccountNumber] = useState(
    existingPayment?.accountNumber || (userProfile?.bankAccountLast4 ? `30894451${userProfile.bankAccountLast4}` : '')
  );
  const [ifscCode, setIfscCode] = useState(
    existingPayment?.ifscCode || (role === 'farmer' ? 'SBIN0001234' : 'HDFC0000456')
  );
  const [accountType, setAccountType] = useState<'Savings' | 'Current' | 'KCC (Kisan Credit Card)'>(
    existingPayment?.accountType || (role === 'farmer' ? 'KCC (Kisan Credit Card)' : 'Current')
  );
  const [upiId, setUpiId] = useState(
    existingPayment?.upiId ||
      (role === 'farmer' ? '9826011223@oksbi' : 'agroprocure@okhdfcbank')
  );

  // Operational Credentials for Weighbridge
  const [weighbridgeStationId, setWeighbridgeStationId] = useState(
    userProfile?.weighbridgeStationId || 'WB-MP-IND-04'
  );
  const [logisticsLicense, setLogisticsLicense] = useState(
    userProfile?.logisticsLicense || 'MP-MANDI-WB-2024-912'
  );
  const [mandiYard, setMandiYard] = useState(
    userProfile?.mandiYard || 'Sanwer Road Platform Gate #2'
  );

  // Regulatory Credentials for Arbitrator
  const [arbitratorAuthorityId, setArbitratorAuthorityId] = useState(
    userProfile?.arbitratorAuthorityId || 'ARB-AGRI-MP-2026-88'
  );
  const [arbitratorDesignation, setArbitratorDesignation] = useState(
    userProfile?.arbitratorDesignation || 'Certified Agricultural Contract Arbitrator'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isProfileModalOpen || !userProfile) return null;

  const isFarmer = role === 'farmer';
  const isBuyer = role === 'buyer';
  const isWeighbridge = role === 'logistics';
  const isArbitrator = role === 'admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedPayment: PaymentDetails | undefined = undefined;

    if (isFarmer || isBuyer) {
      updatedPayment = {
        method: paymentMethod,
        bankName,
        accountHolderName: accountHolderName.trim() || displayName,
        accountNumber: paymentMethod === 'bank' ? accountNumber : '',
        ifscCode: paymentMethod === 'bank' ? ifscCode.toUpperCase() : '',
        accountType: paymentMethod === 'bank' ? accountType : undefined,
        upiId: paymentMethod === 'upi' ? upiId.trim() : '',
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      };
    }

    const last4 = isFarmer || isBuyer
      ? paymentMethod === 'bank'
        ? accountNumber.slice(-4) || '4821'
        : upiId.slice(0, 4)
      : undefined;

    await updateUserProfile({
      displayName,
      phone,
      organization,
      district,
      role,
      paymentDetails: updatedPayment,
      bankAccountLast4: last4,
      // Weighbridge operational fields
      weighbridgeStationId: isWeighbridge ? weighbridgeStationId : undefined,
      logisticsLicense: isWeighbridge ? logisticsLicense : undefined,
      mandiYard: isWeighbridge ? mandiYard : undefined,
      // Arbitrator operational fields
      arbitratorAuthorityId: isArbitrator ? arbitratorAuthorityId : undefined,
      arbitratorDesignation: isArbitrator ? arbitratorDesignation : undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeProfileModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 md:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeProfileModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
              isFarmer
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                : isBuyer
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                : isWeighbridge
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-600'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
            }`}
          >
            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t.profileTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Synced with Cloud Firestore (UID: {userProfile.uid.slice(0, 10)}...)
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-left">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400">
                Full Name / Contact Person
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Contact
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Operational Role Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Operational Role in Supply Chain
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
            >
              <option value="farmer">Farmer FPO / Producer (Receives Escrow Payouts)</option>
              <option value="buyer">Wholesale Buyer / Mill (Funds Escrow & Receives Refunds)</option>
              <option value="logistics">Weighbridge Station Operator (Operational Terminal)</option>
              <option value="admin">Management Arbitrator (Judicial Tribunal Desk)</option>
            </select>
          </div>

          {/* Organization & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-500" /> Organization / Entity
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                placeholder="e.g. Malwa Organic FPO"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> District / Mandi
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                placeholder="e.g. Indore Mandi, MP"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* CONDITIONAL PAYMENT SECTION: ONLY FOR FARMER & BUYER           */}
          {/* ============================================================== */}
          {isFarmer || isBuyer ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isFarmer
                        ? 'Bank Account or UPI to Receive Payment'
                        : 'Trade Settlement Bank or UPI Account'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isFarmer
                      ? 'Harvest payouts are credited here upon weighbridge tare/gross clearance.'
                      : 'Corporate account for locking escrow deposits and receiving variance refunds.'}
                  </p>
                </div>
              </div>

              {/* Method Selector Tabs */}
              <div className="flex gap-2 p-1 bg-slate-200/80 dark:bg-slate-700/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'bank'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Bank Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'upi'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>UPI ID (VPA)</span>
                </button>
              </div>

              {paymentMethod === 'bank' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Bank Name
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                    >
                      {COMMON_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Account Holder / Beneficiary
                      </label>
                      <input
                        type="text"
                        required
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Name as in Bank Passbook"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Account Type
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="Savings">Savings Account</option>
                        <option value="KCC (Kisan Credit Card)">Kisan Credit Card (KCC)</option>
                        <option value="Current">Current / Business Account</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Bank Account Number"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={ifscCode}
                        onChange={(e) =>
                          setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                        }
                        placeholder="SBIN0001234"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      UPI ID (Virtual Payment Address - VPA)
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                      placeholder="e.g. 9826011223@oksbi or farmer@paytm"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      UPI Registered Beneficiary
                    </label>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Name registered on UPI"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NPCI Penny Drop Verified for Instant Escrow Payouts</span>
              </div>
            </div>
          ) : null}

          {/* ============================================================== */}
          {/* WEIGHBRIDGE OPERATOR: OPERATIONAL CREDENTIALS (NO BANK/UPI)     */}
          {/* ============================================================== */}
          {isWeighbridge ? (
            <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-extrabold text-xs">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>Weighbridge Station Credential (No Personal Bank Required)</span>
              </div>
              <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                Weighbridge operators do not receive escrow payouts or pay for crops. Station terminals operate as neutral certifying authorities to log truck tare and gross weight.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 mb-1">
                    Station Terminal ID
                  </label>
                  <input
                    type="text"
                    value={weighbridgeStationId}
                    onChange={(e) => setWeighbridgeStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 mb-1">
                    Mandi Yard License No
                  </label>
                  <input
                    type="text"
                    value={logisticsLicense}
                    onChange={(e) => setLogisticsLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 mb-1">
                  Yard Location / Gate Platform
                </label>
                <input
                  type="text"
                  value={mandiYard}
                  onChange={(e) => setMandiYard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                />
              </div>
            </div>
          ) : null}

          {/* ============================================================== */}
          {/* ARBITRATOR: TRIBUNAL CREDENTIALS (NO BANK/UPI)                  */}
          {/* ============================================================== */}
          {isArbitrator ? (
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-extrabold text-xs">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Arbitration Tribunal Authority (No Personal Bank Required)</span>
              </div>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                Management Arbitrators serve as neutral judicial officers for agricultural dispute mediation. As judicial arbiters, personal banking information is neither required nor maintained.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300 mb-1">
                  Arbitration Bar / Council Reg No.
                </label>
                <input
                  type="text"
                  value={arbitratorAuthorityId}
                  onChange={(e) => setArbitratorAuthorityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300 mb-1">
                  Designation & Jurisdiction
                </label>
                <input
                  type="text"
                  value={arbitratorDesignation}
                  onChange={(e) => setArbitratorDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                />
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Profile & Details Saved!' : t.saveProfile}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
