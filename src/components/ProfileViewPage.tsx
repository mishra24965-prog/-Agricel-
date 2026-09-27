import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tractor,
  Store,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Building2,
  CreditCard,
  MapPin,
  Phone,
  User,
  Save,
  Check,
  Copy,
  Building,
  Landmark,
  FileCheck2,
  Layers,
  Mail,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { PaymentDetails, UserRole } from '../types';

interface ProfileViewPageProps {
  language: Language;
  activePortal?: UserRole;
  onNavigateTab?: (tab: string, portal?: UserRole) => void;
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

export const ProfileViewPage: React.FC<ProfileViewPageProps> = ({
  language,
  activePortal,
  onNavigateTab: _onNavigateTab,
}) => {
  const { userProfile, updateUserProfile } = useAuth();
  const isHindi = language === 'hi';

  // The role of this profile is strictly determined by the active portal context!
  const currentRole: UserRole = activePortal || userProfile?.role || 'farmer';
  const isFarmer = currentRole === 'farmer';
  const isBuyer = currentRole === 'buyer';
  const isWeighbridge = currentRole === 'logistics';
  const isArbitrator = currentRole === 'admin';

  // Form States - General Details
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Madhya Pradesh');
  const [address, setAddress] = useState('');
  const [panOrGstin, setPanOrGstin] = useState('');

  // Form States - Farmer Details
  const [farmLandAcres, setFarmLandAcres] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [khasraNumber, setKhasraNumber] = useState('');
  const [kisanId, setKisanId] = useState('');

  // Form States - Buyer Details
  const [annualProcurementQuota, setAnnualProcurementQuota] = useState('');
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState('');
  const [mandiLicenseId, setMandiLicenseId] = useState('');

  // Form States - Payment Details (Farmer & Buyer)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank');
  const [bankName, setBankName] = useState('State Bank of India (SBI)');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState<'Savings' | 'Current' | 'KCC (Kisan Credit Card)'>('KCC (Kisan Credit Card)');
  const [upiId, setUpiId] = useState('');
  const [isPaymentVerified, setIsPaymentVerified] = useState(true);
  const [verifiedAt, setVerifiedAt] = useState('');

  // Form States - Weighbridge Operational Details
  const [weighbridgeStationId, setWeighbridgeStationId] = useState('');
  const [logisticsLicense, setLogisticsLicense] = useState('');
  const [mandiYard, setMandiYard] = useState('');
  const [logisticsCapacity, setLogisticsCapacity] = useState('');
  const [calibrationCertificate, setCalibrationCertificate] = useState('');
  const [calibrationExpiry, setCalibrationExpiry] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  // Form States - Arbitrator Regulatory Details
  const [arbitratorAuthorityId, setArbitratorAuthorityId] = useState('');
  const [arbitratorDesignation, setArbitratorDesignation] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [jurisdictionMandis, setJurisdictionMandis] = useState('');
  const [barCouncilTenure, setBarCouncilTenure] = useState('');
  const [digitalSignatureCert, setDigitalSignatureCert] = useState('');

  // UI Interactive States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testingPennyDrop, setTestingPennyDrop] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load from userProfile into local form states based on current active role
  const populateFromProfile = () => {
    // 1. General Info
    if (isFarmer) {
      setDisplayName(userProfile?.displayName || 'Rajesh Kumar (Malwa FPO)');
      setPhone(userProfile?.phone || '+91 98260 11223');
      setEmail(userProfile?.email || 'rajesh.malwa@agricel.io');
      setOrganization(userProfile?.organization || 'Malwa Organic Farmers Producer Co.');
      setDistrict(userProfile?.district || 'Indore District, MP');
      setState(userProfile?.state || 'Madhya Pradesh');
      setAddress(userProfile?.facilityAddress || 'Village Sanwer, Tehsil Sanwer, Dist Indore, MP - 453551');
      setPanOrGstin(userProfile?.panOrGstin || 'AQMPK8812A');

      setFarmLandAcres(userProfile?.farmLandAcres || '18.5 Acres');
      setPrimaryCrops(userProfile?.primaryCrops || 'Sharbati Wheat, Lokwan Wheat, Yellow Soybean, Chana');
      setKhasraNumber('KH-MP-IND-2026-8812/A');
      setKisanId('KMP-IND-2026-88');

      // Farmer Payment Defaults
      const pay = userProfile?.paymentDetails;
      if (pay && pay.method) {
        setPaymentMethod(pay.method);
        setBankName(pay.bankName || 'State Bank of India (SBI)');
        setAccountHolderName(pay.accountHolderName || userProfile?.displayName || 'Rajesh Kumar');
        const acc = pay.accountNumber || '308944514821';
        setAccountNumber(acc);
        setConfirmAccountNumber(acc);
        setIfscCode(pay.ifscCode || 'SBIN0001234');
        setAccountType(pay.accountType || 'KCC (Kisan Credit Card)');
        setUpiId(pay.upiId || '9826011223@oksbi');
        setIsPaymentVerified(pay.isVerified ?? true);
        setVerifiedAt(pay.verifiedAt || new Date().toISOString());
      } else {
        setPaymentMethod('bank');
        setBankName('State Bank of India (SBI)');
        setAccountHolderName(userProfile?.displayName || 'Rajesh Kumar');
        setAccountNumber('308944514821');
        setConfirmAccountNumber('308944514821');
        setIfscCode('SBIN0001234');
        setAccountType('KCC (Kisan Credit Card)');
        setUpiId('9826011223@oksbi');
        setIsPaymentVerified(true);
        setVerifiedAt(new Date().toISOString());
      }
    } else if (isBuyer) {
      setDisplayName(userProfile?.role === 'buyer' ? (userProfile.displayName || 'AgroProcure Wholesale Mills') : 'AgroProcure Wholesale Mills (Indore)');
      setPhone(userProfile?.role === 'buyer' ? (userProfile.phone || '+91 98930 55443') : '+91 98930 55443');
      setEmail(userProfile?.role === 'buyer' ? (userProfile.email || 'procure@agromills.in') : 'procure@agromills.in');
      setOrganization(userProfile?.role === 'buyer' ? (userProfile.organization || 'AgroProcure Foods & Milling Industries Ltd.') : 'AgroProcure Foods & Milling Industries Ltd.');
      setDistrict(userProfile?.role === 'buyer' ? (userProfile.district || 'Indore Industrial Area, MP') : 'Indore Industrial Area, MP');
      setState('Madhya Pradesh');
      setAddress(userProfile?.role === 'buyer' ? (userProfile.facilityAddress || 'Plot 44-B, Sector C, Sanwer Road Industrial Area, Indore - 452015') : 'Plot 44-B, Sector C, Sanwer Road Industrial Area, Indore - 452015');
      setPanOrGstin(userProfile?.role === 'buyer' ? (userProfile.panOrGstin || '23AAACA1234A1Z5') : '23AAACA1234A1Z5');

      setAnnualProcurementQuota(userProfile?.annualProcurementQuota || '5,000 MT / Year');
      setTradeLicenseNumber('MP-MANDI-TRADE-2024-419');
      setMandiLicenseId('APMC-IND-COMM-8891');

      // Buyer Payment/Escrow Defaults
      const pay = userProfile?.paymentDetails;
      if (pay && userProfile?.role === 'buyer') {
        setPaymentMethod(pay.method || 'bank');
        setBankName(pay.bankName || 'HDFC Bank');
        setAccountHolderName(pay.accountHolderName || 'AgroProcure Foods & Milling Industries Ltd.');
        const acc = pay.accountNumber || '50200049219901';
        setAccountNumber(acc);
        setConfirmAccountNumber(acc);
        setIfscCode(pay.ifscCode || 'HDFC0000456');
        setAccountType('Current');
        setUpiId(pay.upiId || 'procure.mills@okhdfcbank');
        setIsPaymentVerified(pay.isVerified ?? true);
        setVerifiedAt(pay.verifiedAt || new Date().toISOString());
      } else {
        setPaymentMethod('bank');
        setBankName('HDFC Bank');
        setAccountHolderName('AgroProcure Foods & Milling Industries Ltd.');
        setAccountNumber('50200049219901');
        setConfirmAccountNumber('50200049219901');
        setIfscCode('HDFC0000456');
        setAccountType('Current');
        setUpiId('procure.mills@okhdfcbank');
        setIsPaymentVerified(true);
        setVerifiedAt(new Date().toISOString());
      }
    } else if (isWeighbridge) {
      setDisplayName(userProfile?.role === 'logistics' ? (userProfile.displayName || 'Indore Certified Scale Terminal #4') : 'Indore Certified Scale Terminal #4');
      setPhone(userProfile?.role === 'logistics' ? (userProfile.phone || '+91 94250 11990') : '+91 94250 11990');
      setEmail('weighbridge4.indore@apmc-gov.in');
      setOrganization('Indore Krishi Upaj Mandi Samiti (Sanwer Road)');
      setDistrict('Indore APMC Mandi Yard, MP');
      setState('Madhya Pradesh');
      setAddress('Platform #4, Electronic Weighbridge Compound, Gate #2, Krishi Upaj Mandi, Indore - 452003');
      setPanOrGstin('MPGOVWB8819');

      setWeighbridgeStationId(userProfile?.weighbridgeStationId || 'WB-MP-IND-04');
      setLogisticsLicense(userProfile?.logisticsLicense || 'MP-MANDI-WB-2024-912');
      setMandiYard(userProfile?.mandiYard || 'Sanwer Road Platform Gate #2');
      setLogisticsCapacity(userProfile?.logisticsCapacity || '60 MT Electronic Pitless Dual-Deck');
      setCalibrationCertificate(userProfile?.calibrationCertificate || 'MP-WM-CALIB-88491');
      setCalibrationExpiry(userProfile?.calibrationExpiry || '2027-03-31');
      setOperatingHours(userProfile?.operatingHours || '06:00 AM – 10:00 PM IST (Mon–Sat)');
    } else if (isArbitrator) {
      setDisplayName(userProfile?.role === 'admin' ? (userProfile.displayName || 'Agricel APMC Dispute Tribunal Officer') : 'Adv. Suresh Chandra Sharma');
      setPhone(userProfile?.role === 'admin' ? (userProfile.phone || '+91 80000 12345') : '+91 98270 54321');
      setEmail('tribunal.indore@agricel.gov.in');
      setOrganization('State Agricultural Marketing Board Arbitration Chamber');
      setDistrict('Indore Division APMC Tribunal, MP');
      setState('Madhya Pradesh');
      setAddress('Chamber #12, Agricultural Dispute Tribunal Block, Mandi Bhavan, Indore - 452001');
      setPanOrGstin('ARBMP1982A');

      setArbitratorAuthorityId(userProfile?.arbitratorAuthorityId || 'ARB-AGRI-MP-2026-88');
      setArbitratorDesignation(userProfile?.arbitratorDesignation || 'Senior APMC Tribunal Arbitrator & Former Registrar');
      setJurisdiction(userProfile?.jurisdiction || 'Western Madhya Pradesh Agricultural Disputed Contracts');
      setJurisdictionMandis(userProfile?.jurisdictionMandis || 'Indore, Ujjain, Dewas, Dhar & Khargone APMC Mandis');
      setBarCouncilTenure(userProfile?.barCouncilTenure || 'Empaneled since 2018 (MP Bar Council #14892)');
      setDigitalSignatureCert(userProfile?.digitalSignatureCert || 'DSC-CLASS-3-AGRI-TRIBUNAL-2026');
    }
  };

  useEffect(() => {
    populateFromProfile();
  }, [userProfile, currentRole]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Simulated Penny Drop verification for Farmer & Buyer
  const handleRunPennyDrop = () => {
    setTestingPennyDrop(true);
    setErrorMessage('');
    setTimeout(() => {
      setTestingPennyDrop(false);
      setIsPaymentVerified(true);
      setVerifiedAt(new Date().toISOString());
      setSaveSuccessMessage(
        paymentMethod === 'bank'
          ? (isHindi ? '₹1.00 पेनी-ड्रॉप बैंक सत्यापन सफल (NPCI सक्रिय)' : '₹1.00 Penny Drop Verified! Bank account verified on NPCI network.')
          : (isHindi ? 'UPI VPA पिंग सत्यापन सफल (NPCI सक्रिय)' : 'UPI VPA Ping Verified! Virtual Payment Address verified on NPCI network.')
      );
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    }, 1200);
  };

  // Save all profile details for this specific role
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);

    try {
      let updatedPayment: PaymentDetails | undefined = undefined;

      if (isFarmer || isBuyer) {
        if (paymentMethod === 'bank') {
          if (accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber) {
            setErrorMessage(isHindi ? 'खाता संख्या और पुष्टि मेल नहीं खाती।' : 'Bank account number and confirm account number do not match.');
            setIsSaving(false);
            return;
          }
        }

        updatedPayment = {
          method: paymentMethod,
          bankName: paymentMethod === 'bank' ? bankName : '',
          accountHolderName: accountHolderName.trim() || displayName,
          accountNumber: paymentMethod === 'bank' ? accountNumber.trim() : '',
          ifscCode: paymentMethod === 'bank' ? ifscCode.trim().toUpperCase() : '',
          accountType: paymentMethod === 'bank' ? accountType : undefined,
          upiId: paymentMethod === 'upi' ? upiId.trim() : '',
          isVerified: isPaymentVerified,
          verifiedAt: verifiedAt || new Date().toISOString(),
        };
      }

      const last4 =
        isFarmer || isBuyer
          ? paymentMethod === 'bank'
            ? accountNumber.slice(-4) || '4821'
            : upiId.slice(0, 4)
          : undefined;

      await updateUserProfile({
        displayName,
        phone,
        email,
        organization,
        district,
        state,
        facilityAddress: address,
        panOrGstin,
        role: currentRole,
        // Farmer specifics
        farmLandAcres: isFarmer ? farmLandAcres : undefined,
        primaryCrops: isFarmer ? primaryCrops : undefined,
        // Buyer specifics
        annualProcurementQuota: isBuyer ? annualProcurementQuota : undefined,
        tradeTerms: isBuyer ? tradeLicenseNumber : undefined,
        // Financials (Only Farmer and Buyer)
        paymentDetails: updatedPayment,
        bankAccountLast4: last4,
        // Weighbridge credentials
        weighbridgeStationId: isWeighbridge ? weighbridgeStationId : undefined,
        logisticsLicense: isWeighbridge ? logisticsLicense : undefined,
        mandiYard: isWeighbridge ? mandiYard : undefined,
        logisticsCapacity: isWeighbridge ? logisticsCapacity : undefined,
        calibrationCertificate: isWeighbridge ? calibrationCertificate : undefined,
        calibrationExpiry: isWeighbridge ? calibrationExpiry : undefined,
        operatingHours: isWeighbridge ? operatingHours : undefined,
        // Arbitrator credentials
        arbitratorAuthorityId: isArbitrator ? arbitratorAuthorityId : undefined,
        arbitratorDesignation: isArbitrator ? arbitratorDesignation : undefined,
        jurisdiction: isArbitrator ? jurisdiction : undefined,
        jurisdictionMandis: isArbitrator ? jurisdictionMandis : undefined,
        barCouncilTenure: isArbitrator ? barCouncilTenure : undefined,
        digitalSignatureCert: isArbitrator ? digitalSignatureCert : undefined,
      });

      setSaveSuccessMessage(
        isHindi ? 'सभी प्रोफ़ाइल विवरण व क्रेडेंशियल सफलतापूर्वक सहेजे गए।' : 'Profile details and credentials updated successfully.'
      );
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMessage(isHindi ? 'प्रोफ़ाइल सहेजने में त्रुटि हुई।' : 'Error updating profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const roleTitle = isFarmer
    ? (isHindi ? 'किसान प्रोफ़ाइल व बैंक विवरण' : 'Farmer Profile & Bank Credentials')
    : isBuyer
    ? (isHindi ? 'थोक खरीदार प्रोफ़ाइल व एस्क्रो खाता' : 'Wholesale Buyer Profile & Escrow Account')
    : isWeighbridge
    ? (isHindi ? 'तौल पुल टर्मिनल प्रोफ़ाइल' : 'Weighbridge Terminal Profile')
    : (isHindi ? 'मध्यस्थता न्यायाधिकरण प्रोफ़ाइल' : 'Arbitration Tribunal Profile');

  const roleSubtitle = isFarmer
    ? (isHindi ? 'व्यक्तिगत विवरण, भूमि रिकॉर्ड (खसरा), फसल विवरण और ६०-सेकंड बैंक भुगतान विवरण संपादित करें।' : 'Manage your personal details, land records, primary crops, and direct bank payout settings.')
    : isBuyer
    ? (isHindi ? 'कंपनी जीएसटी, मंडी व्यापार लाइसेंस और एस्क्रो वॉल्ट खाता विवरण संपादित करें।' : 'Manage corporate registration, GSTIN, mandi procurement quota, and trade escrow accounts.')
    : isWeighbridge
    ? (isHindi ? 'इलेक्ट्रॉनिक तौल पुल लाइसेंस, स्केल क्षमता और कैलिब्रेशन प्रमाणपत्र विवरण प्रबंधित करें।' : 'Manage electronic scale registration, platform capacity, and weights & measures calibration records.')
    : (isHindi ? 'न्यायिक न्यायाधिकरण प्राधिकरण, बार काउंसिल पंजीकरण और अधिकार क्षेत्र विवरण प्रबंधित करें।' : 'Manage judicial authority empanelment, bar council enrollment, and mandi jurisdiction.');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. CLEAN HEADER (Details-Oriented, No Marketing/Welcome) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm ${
              isFarmer
                ? 'bg-emerald-600'
                : isBuyer
                ? 'bg-blue-600'
                : isWeighbridge
                ? 'bg-purple-600'
                : 'bg-rose-600'
            }`}
          >
            {isFarmer && <Tractor className="w-6 h-6" />}
            {isBuyer && <Store className="w-6 h-6" />}
            {isWeighbridge && <Scale className="w-6 h-6" />}
            {isArbitrator && <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                {roleTitle}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isFarmer
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/50'
                    : isBuyer
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300/50'
                    : isWeighbridge
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/50'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/50'
                }`}
              >
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {roleSubtitle}
            </p>
          </div>
        </div>

        {/* Top Direct Save Button */}
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all shadow-sm disabled:opacity-50 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isHindi ? 'सहेज रहे हैं...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isHindi ? 'परिवर्तन सहेजें' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Success / Error Alerts */}
      <AnimatePresence>
        {saveSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 text-xs font-bold shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMessage('')}
              className="text-xs text-emerald-700 dark:text-emerald-400 underline font-bold"
            >
              {isHindi ? 'बंद करें' : 'Dismiss'}
            </button>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3 text-xs font-bold shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-xs text-rose-700 dark:text-rose-400 underline font-bold"
            >
              {isHindi ? 'बंद करें' : 'Dismiss'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FORM BODY - PURE DETAILS & EDIT FIELDS */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {isHindi ? '१. व्यक्तिगत एवं संपर्क विवरण' : '1. Personal & Contact Information'}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {isHindi ? 'अनिवार्य फ़ील्ड (*)' : 'Required fields (*)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isFarmer
                  ? (isHindi ? 'किसान का पूरा नाम / अधिकृत प्रतिनिधि *' : 'Farmer / Representative Full Name *')
                  : isBuyer
                  ? (isHindi ? 'अधिकृत खरीद प्रबंधक का नाम *' : 'Authorized Procurement Manager *')
                  : isWeighbridge
                  ? (isHindi ? 'तौल पुल अधीक्षक / ऑपरेटर का नाम *' : 'Scale Superintendent / Operator Name *')
                  : (isHindi ? 'पीठासीन मध्यस्थ / अधिवक्ता का नाम *' : 'Presiding Arbitrator Name *')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'पंजीकृत मोबाइल नंबर (SMS/OTP) *' : 'Registered Mobile Number (SMS/OTP) *'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="+91 98260 11223"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'ईमेल पता' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="name@domain.com"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Organization / FPO */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isFarmer
                  ? (isHindi ? 'एफपीओ / सहकारी समिति / फार्म होल्डिंग का नाम' : 'FPO / Cooperative / Farm Holding')
                  : isBuyer
                  ? (isHindi ? 'मिल / कॉर्पोरेट संस्थान का नाम' : 'Mill / Corporate Entity Name')
                  : isWeighbridge
                  ? (isHindi ? 'मंडी समिति / लॉजिस्टिक्स प्राधिकरण' : 'Mandi Samiti / Operating Entity')
                  : (isHindi ? 'मध्यस्थता न्यायाधिकरण चैंबर' : 'Arbitration Tribunal Chamber')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Malwa Organic Farmers Producer Co."
                />
                <Building className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* District & Mandi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'जिला एवं मंडी केंद्र *' : 'District & Mandi Hub *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Indore District, MP"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'राज्य *' : 'State *'}
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Madhya Pradesh"
              />
            </div>

            {/* Complete Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'पूर्ण पता (तहसील, गांव / औद्योगिक क्षेत्र, पिन कोड)' : 'Complete Address (Tehsil, Village/Industrial Area, PIN)'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Village Sanwer, Tehsil Sanwer, Dist Indore, MP - 453551"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ROLE-SPECIFIC CREDENTIALS & REGISTRATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {isFarmer && (isHindi ? '२. किसान कृषि एवं भूमि क्रेडेंशियल' : '2. Farmer Agricultural & Land Credentials')}
                {isBuyer && (isHindi ? '२. कॉरपोरेट खरीद एवं व्यापार क्रेडेंशियल' : '2. Corporate Procurement & Trade Credentials')}
                {isWeighbridge && (isHindi ? '२. तौल पुल तकनीकी व वैधानिक क्रेडेंशियल' : '2. Scale Technical & Legal Credentials')}
                {isArbitrator && (isHindi ? '२. न्यायाधिकरण वैधानिक क्रेडेंशियल' : '2. Tribunal Judicial Empanelment Credentials')}
              </h2>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isHindi ? 'सत्यापित' : 'Active'}
            </span>
          </div>

          {/* FARMER FIELDS */}
          {isFarmer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'कुल कृषि भूमि (एकड़)' : 'Total Land Holding (Acres)'}
                </label>
                <input
                  type="text"
                  value={farmLandAcres}
                  onChange={(e) => setFarmLandAcres(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 18.5 Acres"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'भूमि खसरा संख्या / खाता संख्या' : 'Khasra / Land Record Number'}
                </label>
                <input
                  type="text"
                  value={khasraNumber}
                  onChange={(e) => setKhasraNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="KH-MP-IND-2026-8812/A"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'किसान आईडी / आधार संदर्भ' : 'Kisan Registration ID #'}
                </label>
                <input
                  type="text"
                  value={kisanId}
                  onChange={(e) => setKisanId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="KMP-IND-2026-88"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'पैन नंबर' : 'PAN Card Number'}
                </label>
                <input
                  type="text"
                  value={panOrGstin}
                  onChange={(e) => setPanOrGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="AQMPK8812A"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'मुख्य उत्पादित फसलें' : 'Primary Harvest Crops'}
                </label>
                <input
                  type="text"
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Sharbati Wheat, Lokwan Wheat, Yellow Soybean, Chana"
                />
              </div>
            </div>
          )}

          {/* BUYER FIELDS */}
          {isBuyer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'जीएसटी संख्या (GSTIN) *' : 'Corporate GSTIN Number *'}
                </label>
                <input
                  type="text"
                  value={panOrGstin}
                  onChange={(e) => setPanOrGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="23AAACA1234A1Z5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'वार्षिक खरीद क्षमता (मीट्रिक टन)' : 'Annual Procurement Quota (MT)'}
                </label>
                <input
                  type="text"
                  value={annualProcurementQuota}
                  onChange={(e) => setAnnualProcurementQuota(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="5,000 MT / Year"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'मंडी थोक व्यापार लाइसेंस संख्या' : 'Mandi Wholesale Trade License #'}
                </label>
                <input
                  type="text"
                  value={tradeLicenseNumber}
                  onChange={(e) => setTradeLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="MP-MANDI-TRADE-2024-419"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'एपीएमसी व्यापारी पंजीकरण कोड' : 'APMC Commercial Trader Code'}
                </label>
                <input
                  type="text"
                  value={mandiLicenseId}
                  onChange={(e) => setMandiLicenseId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="APMC-IND-COMM-8891"
                />
              </div>
            </div>
          )}

          {/* WEIGHBRIDGE FIELDS */}
          {isWeighbridge && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'तौल पुल स्टेशन आईडी *' : 'Weighbridge Terminal Station ID *'}
                </label>
                <input
                  type="text"
                  value={weighbridgeStationId}
                  onChange={(e) => setWeighbridgeStationId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="WB-MP-IND-04"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'मंडी बोर्ड लाइसेंस संख्या' : 'Mandi Board Scale License #'}
                </label>
                <input
                  type="text"
                  value={logisticsLicense}
                  onChange={(e) => setLogisticsLicense(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="MP-MANDI-WB-2024-912"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'प्लेटफॉर्म क्षमता (टन)' : 'Scale Platform Capacity (MT)'}
                </label>
                <input
                  type="text"
                  value={logisticsCapacity}
                  onChange={(e) => setLogisticsCapacity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="60 MT Electronic Pitless Dual-Deck"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'वैधानिक कैलिब्रेशन प्रमाणपत्र संख्या' : 'Weights & Measures Calibration Cert #'}
                </label>
                <input
                  type="text"
                  value={calibrationCertificate}
                  onChange={(e) => setCalibrationCertificate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="MP-WM-CALIB-88491"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'कैलिब्रेशन वैधता तिथि' : 'Calibration Validity Expiry'}
                </label>
                <input
                  type="date"
                  value={calibrationExpiry}
                  onChange={(e) => setCalibrationExpiry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'संचालन समय' : 'Operating Shift Hours'}
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="06:00 AM – 10:00 PM IST (Mon–Sat)"
                />
              </div>
            </div>
          )}

          {/* ARBITRATOR FIELDS */}
          {isArbitrator && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'मध्यस्थ प्राधिकरण संख्या *' : 'Tribunal Arbitrator Authority ID *'}
                </label>
                <input
                  type="text"
                  value={arbitratorAuthorityId}
                  onChange={(e) => setArbitratorAuthorityId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="ARB-AGRI-MP-2026-88"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'आधिकारिक पदनाम' : 'Official Designation'}
                </label>
                <input
                  type="text"
                  value={arbitratorDesignation}
                  onChange={(e) => setArbitratorDesignation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Senior APMC Tribunal Arbitrator & Former Registrar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'अधिकार क्षेत्र एवं मंडियां' : 'Jurisdiction Mandis'}
                </label>
                <input
                  type="text"
                  value={jurisdictionMandis}
                  onChange={(e) => setJurisdictionMandis(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Indore, Ujjain, Dewas, Dhar & Khargone APMC Mandis"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'बार काउंसिल नामांकन संख्या' : 'Bar Council Enrollment / Empanelment'}
                </label>
                <input
                  type="text"
                  value={barCouncilTenure}
                  onChange={(e) => setBarCouncilTenure(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="MP Bar Council #14892 (Empaneled since 2018)"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: PAYMENT & BANK PAYOUT SETTINGS (FARMER & BUYER ONLY) */}
        {(isFarmer || isBuyer) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isFarmer
                    ? (isHindi ? '३. ६०-सेकंड सीधा बैंक भुगतान गंतव्य (एस्क्रो पेआउट)' : '3. 60-Second Direct Bank Payout Destination (Escrow Payout)')
                    : (isHindi ? '३. एस्क्रो वॉल्ट एवं रिफंड निपटान बैंक खाता' : '3. Escrow Vault & Trade Settlement Bank Account')}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isHindi ? 'एनपीसीआई सक्रिय' : 'NPCI Active'}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>{isHindi ? 'बैंक खाता (IMPS/NEFT/RTGS)' : 'Bank Account (IMPS/NEFT/RTGS)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{isHindi ? 'यूपीआई आईडी (Instant VPA)' : 'UPI ID (Instant VPA)'}</span>
              </button>
            </div>

            {/* Bank Form */}
            {paymentMethod === 'bank' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'बैंक का नाम *' : 'Bank Name *'}
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {COMMON_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'खाता धारक का नाम *' : 'Account Holder Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Rajesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'बैंक खाता संख्या *' : 'Bank Account Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="308944514821"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'खाता संख्या की पुष्टि करें *' : 'Confirm Account Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="308944514821"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'आईएफएससी कोड (IFSC) *' : 'IFSC Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="SBIN0001234"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'खाते का प्रकार *' : 'Account Type *'}
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="KCC (Kisan Credit Card)">KCC (Kisan Credit Card)</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Account</option>
                  </select>
                </div>
              </div>
            ) : (
              /* UPI Form */
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'यूपीआई आईडी (VPA) *' : 'Virtual Payment Address (UPI ID) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="9826011223@oksbi"
                  />
                </div>

                {/* Quick UPI Handle Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">
                    {isHindi ? 'शीघ्र चयन:' : 'Quick Select:'}
                  </span>
                  {['@oksbi', '@okhdfcbank', '@paytm', '@ybl', '@barodampay'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => {
                        const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId || '9826011223';
                        setUpiId(`${prefix}${handle}`);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 border border-slate-200 dark:border-slate-700"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Penny Drop Verification Trigger */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {isHindi
                    ? 'एनपीसीआई लाइव पेनी-ड्रॉप से खाते की सत्यता जांची गई है।'
                    : 'Account verified for automated 60-second escrow settlement via NPCI.'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunPennyDrop}
                disabled={testingPennyDrop}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
              >
                {testingPennyDrop
                  ? (isHindi ? 'सत्यापन जारी...' : 'Verifying...')
                  : (isHindi ? 'पेनी-ड्रॉप पुनः जांचें' : 'Re-verify Penny Drop')}
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={populateFromProfile}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            {isHindi ? 'रीसेट करें' : 'Reset'}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isHindi ? 'सहेज रहे हैं...' : 'Saving Changes...'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isHindi ? 'परिवर्तन सहेजें' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
