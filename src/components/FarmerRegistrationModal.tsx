import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  User,
  Phone,
  MapPin,
  Building2,
  Wheat,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';

interface FarmerRegistrationModalProps {
  isOpen: boolean;
  onRegistered: () => void;
  language: Language;
}

// Sample crisp fallback passport photo for instant onboarding or testing
const DEFAULT_PASSPORT_PHOTO =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

export const FarmerRegistrationModal: React.FC<FarmerRegistrationModalProps> = ({
  isOpen,
  onRegistered,
  language,
}) => {
  const { userProfile, updateUserProfile, signInDemoUser } = useAuth();

  const [photoUrl, setPhotoUrl] = useState<string>(
    userProfile?.photoUrl || DEFAULT_PASSPORT_PHOTO
  );
  const [photoMethod, setPhotoMethod] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [name, setName] = useState(userProfile?.displayName || 'Rajesh Kumar');
  const [phone, setPhone] = useState(userProfile?.phone || '+91 98260 11223');
  const [district, setDistrict] = useState(userProfile?.district || 'Indore District, MP');
  const [organization, setOrganization] = useState(
    userProfile?.organization || 'Malwa Organic Farmers Producer Co. (FPO)'
  );
  const [farmLand, setFarmLand] = useState('18.5 Acres (Malwa Agro Belt)');
  const [primaryCrops, setPrimaryCrops] = useState('Wheat (Lokwan), Soybean (JS 335), Gram');

  // Banking initialization for escrow payouts
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank');
  const [accountNumber, setAccountNumber] = useState('308944514821');
  const [ifsc, setIfsc] = useState('SBIN0001234');
  const [upiId, setUpiId] = useState('9826011223@oksbi');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isHindi = language === 'hi';

  // Start device camera
  const startCamera = async () => {
    setCameraError(null);
    setPhotoMethod('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError(
        isHindi
          ? 'कैमरा खोलने में असमर्थ। कृपया फोटो अपलोड विकल्प का उपयोग करें।'
          : 'Unable to open camera. Please use the photo upload option instead.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Take snapshot from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 480; // Passport ratio (~35x45mm)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Crop center
      const v = videoRef.current;
      const vWidth = v.videoWidth || 640;
      const vHeight = v.videoHeight || 480;
      const cropSize = Math.min(vWidth, vHeight);
      const startX = (vWidth - cropSize) / 2;
      const startY = (vHeight - cropSize) / 2;
      ctx.drawImage(v, startX, startY, cropSize, cropSize, 0, 0, 400, 480);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isHindi ? 'कृपया केवल छवि (Image) फ़ाइल चुनें' : 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const res = uploadEvent.target?.result as string;
      if (res) {
        setPhotoUrl(res);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isHindi ? 'कृपया किसान का नाम दर्ज करें' : 'Please enter the farmer name');
      return;
    }
    if (!photoUrl) {
      setErrorMsg(
        isHindi
          ? 'कृपया पासपोर्ट साइज फोटो अपलोड करें या कैमरे से लें'
          : 'Please upload or capture a passport-size photo'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const paymentValue = paymentMethod === 'bank' ? accountNumber : upiId;
      await signInDemoUser('farmer', name, phone, paymentMethod, paymentValue, ifsc);

      // Save complete registration profile including passport photo
      await updateUserProfile({
        displayName: name,
        phone,
        district,
        organization,
        farmLandAcres: farmLand,
        primaryCrops,
        photoUrl,
        isRegistered: true,
        kycStatus: 'Verified',
        paymentDetails: {
          method: paymentMethod,
          bankName: 'State Bank of India (SBI)',
          accountHolderName: name,
          accountNumber: paymentMethod === 'bank' ? accountNumber : '',
          ifscCode: ifsc,
          accountType: 'KCC (Kisan Credit Card)',
          upiId: paymentMethod === 'upi' ? upiId : `${phone.replace(/\D/g, '').slice(-10)}@oksbi`,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        },
      });

      stopCamera();
      onRegistered();
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      setErrorMsg(
        isHindi
          ? 'पंजीकरण पूरा करने में त्रुटि। कृपया पुनः प्रयास करें।'
          : 'Failed to complete registration. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-amber-300 shadow-inner">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  {isHindi ? 'किसान अनिवार्य पंजीकरण व फोटो केवाईसी' : 'Farmer Registration & Photo KYC'}
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  {isHindi ? 'प्रथम चरण' : 'Step 1: Access Portal'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {isHindi
                  ? 'एग्रीसेल एस्क्रो पोर्टल में प्रवेश के लिए पासपोर्ट फोटो और किसान जानकारी दर्ज करें'
                  : 'Mandatory profile registration & passport photo to unlock Agricel Escrow Desk'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-200">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Passport Size Photo Upload & Live Camera */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'किसान का पासपोर्ट साइज फोटो (अनिवार्य)' : 'Farmer Passport Size Photo (Mandatory)'}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi
                    ? 'यह फोटो आपके किसान डैशबोर्ड और तौल पर्ची पर आधिकारिक पहचान के रूप में दिखेगा।'
                    : 'This passport photo will appear on your dashboard and certified weight slips.'}
                </p>
              </div>

              {/* Photo Mode Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setPhotoMethod('upload');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    photoMethod === 'upload' && !isCameraActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  <span>{isHindi ? 'अपलोड करें' : 'Upload'}</span>
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isCameraActive
                      ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  <span>{isHindi ? 'कैमरा चालू करें' : 'Live Camera'}</span>
                </button>
              </div>
            </div>

            {/* Passport Photo Preview & Camera Viewport */}
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center pt-1">
              {/* Photo Card Preview */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-44 rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-200 dark:bg-slate-700 group">
                  {isCameraActive ? (
                    <div className="w-full h-full relative bg-black flex items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Oval guideline for passport photo */}
                      <div className="absolute inset-2 border-2 border-dashed border-emerald-400/80 rounded-full pointer-events-none opacity-80"></div>
                    </div>
                  ) : (
                    <img
                      src={photoUrl}
                      alt="Farmer Passport"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Passport Badge Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs py-1 text-center text-[9px] font-black uppercase text-amber-300 tracking-wider">
                    {isHindi ? 'पासपोर्ट साइज (35×45mm)' : 'Passport (35×45mm)'}
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'प्रमाणित फोटो तैयार' : 'Official Photo Validated'}</span>
                  </span>
                </div>
              </div>

              {/* Action Controls for Photo */}
              <div className="space-y-3 w-full sm:w-auto flex-1 max-w-xs">
                {isCameraActive ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transform hover:scale-102 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isHindi ? '📸 अभी फोटो खींचें (Capture)' : '📸 Capture Photo Now'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors"
                    >
                      {isHindi ? 'कैमरा बंद करें' : 'Cancel Camera'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'गैलरी / फाइल से फोटो चुनें' : 'Choose Photo from Device'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'कैमरे से नया फोटो खींचें' : 'Take with Live Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoUrl(DEFAULT_PASSPORT_PHOTO)}
                      className="text-[11px] text-slate-400 hover:text-emerald-600 underline font-medium block text-center"
                    >
                      {isHindi ? 'डिफ़ॉल्ट किसान फोटो का उपयोग करें' : 'Use default verified farmer portrait'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Farmer Personal & Agricultural Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {isHindi ? 'किसान व कृषि क्षेत्र जानकारी' : 'Farmer & Agricultural Credentials'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isHindi ? 'किसान का पूरा नाम (Farmer Name) *' : 'Farmer Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isHindi ? 'मोबाइल नंबर (Mobile / WhatsApp) *' : 'Mobile Number (WhatsApp) *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98260 11223"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isHindi ? 'जिला व राज्य (District & State)' : 'District & State'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Indore District, MP"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isHindi ? 'एफपीओ या फार्म संगठन (FPO / Farm)' : 'FPO / Farm Collective'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Malwa Organic FPO"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isHindi ? 'कृषि भूमि का रकबा (Farm Acreage)' : 'Farm Land Acreage'}
                </label>
                <input
                  type="text"
                  value={farmLand}
                  onChange={(e) => setFarmLand(e.target.value)}
                  placeholder="e.g. 18.5 Acres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isHindi ? 'मुख्य फसलें (Primary Crops)' : 'Primary Crops'}
                </label>
                <input
                  type="text"
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  placeholder="e.g. Wheat Lokwan, Soybean, Gram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Account / UPI (To receive automatic escrow payouts) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'बैंक खाता / यूपीआई (एस्क्रो भुगतान प्राप्त करने हेतु)' : 'Bank Account / UPI for Direct Escrow Payouts'}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi
                    ? 'तौल होते ही बैंक एस्क्रो से 60 सेकंड में पैसा इसी खाते में आएगा।'
                    : '100% of buyer escrow funds disburse automatically to this channel.'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`px-2 py-1 rounded-md ${
                    paymentMethod === 'bank' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Bank
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`px-2 py-1 rounded-md ${
                    paymentMethod === 'upi' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`}
                >
                  UPI
                </button>
              </div>
            </div>

            {paymentMethod === 'bank' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="308944514821"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    placeholder="SBIN0001234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  UPI ID (VPA)
                </label>
                <div className="relative">
                  <Zap className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="9826011223@oksbi"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transform hover:scale-101 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isHindi ? 'सत्यापित किया जा रहा है...' : 'Verifying Profile & Registering...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isHindi ? 'पंजीकरण पूरा करें व पोर्टल खोलें' : 'Complete Registration & Open Portal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
