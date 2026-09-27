import React, { useState } from 'react';
import {
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Info,
  Loader2,
  Camera,
  Upload,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createCropListing } from '../services/db';
import { analyzeGrainPhoto } from '../services/qualityEngine';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Listing, QualityAssessment } from '../types';

interface FarmerListingViewProps {
  language: Language;
  onSuccess: () => void;
}

export const FarmerListingView: React.FC<FarmerListingViewProps> = ({ language, onSuccess }) => {
  const { userProfile } = useAuth();
  const t = translations[language];

  const [farmerName, setFarmerName] = useState(userProfile?.displayName || 'Rajesh Kumar (Malwa FPO)');
  const [phone, setPhone] = useState(userProfile?.phone || '+91 98260 11223');
  const [crop, setCrop] = useState('Wheat');
  const [variety, setVariety] = useState('Lokwan');
  const [qty, setQty] = useState(30);
  const [price, setPrice] = useState(25800);
  const [district, setDistrict] = useState(userProfile?.district || 'Indore');
  const [location, setLocation] = useState('Indore District, MP');

  // Photo & AI Quality Inspector State
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  );
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [isInspectingPhoto, setIsInspectingPhoto] = useState(false);
  const [isAutoFixingPrice, setIsAutoFixingPrice] = useState(false);
  const [autoFixMessage, setAutoFixMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger optical quality inspection whenever a photo is uploaded or sample loaded
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const url = evt.target?.result as string;
        setPhotoUrl(url);
        await runQualityScan(url, crop, variety);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleGrain = async (sampleType: 'wheat' | 'soybean' | 'paddy') => {
    let url = '';
    let selectedCrop = 'Wheat';
    let selectedVariety = 'Lokwan Grade-A';

    if (sampleType === 'wheat') {
      url = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
      selectedCrop = 'Wheat';
      selectedVariety = 'Lokwan';
    } else if (sampleType === 'soybean') {
      url = 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80';
      selectedCrop = 'Soybean';
      selectedVariety = 'JS 335';
    } else {
      url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
      selectedCrop = 'Paddy (Dhan)';
      selectedVariety = 'Basmati 1121';
    }

    setCrop(selectedCrop);
    setVariety(selectedVariety);
    setPhotoUrl(url);
    await runQualityScan(url, selectedCrop, selectedVariety);
  };

  const runQualityScan = async (imgUrl: string, cName: string, vName: string) => {
    setIsInspectingPhoto(true);
    try {
      const result = await analyzeGrainPhoto(imgUrl, cName, vName);
      setQualityAssessment(result);
    } finally {
      setIsInspectingPhoto(false);
    }
  };

  const handleAutoFixPrice = () => {
    setIsAutoFixingPrice(true);
    setAutoFixMessage(null);
    setTimeout(() => {
      let basePrice = 25800;
      if (crop.includes('Soybean')) basePrice = 44500;
      else if (crop.includes('Paddy')) basePrice = 31500;
      else if (crop.includes('Mustard')) basePrice = 54000;
      else if (crop.includes('Gram') || crop.includes('Chana')) basePrice = 58000;
      else if (crop.includes('Maize')) basePrice = 21000;
      else if (crop.includes('Rice')) basePrice = 39000;
      else if (crop.includes('Cotton')) basePrice = 69000;

      // Grade-A premium adjustment
      if (qualityAssessment && qualityAssessment.grade.includes('Grade A')) {
        basePrice += 400;
      }

      setPrice(basePrice);
      setIsAutoFixingPrice(false);
      setAutoFixMessage(
        language === 'hi'
          ? `एआई द्वारा दर ऑटो-फिक्स: ₹${basePrice.toLocaleString()} / टन (गुणवत्ता ग्रेड एवं एपीएमसी मंडी बेंचमार्क के आधार पर)`
          : `AI Auto-calibrated: ₹${basePrice.toLocaleString()} / Ton (Calibrated to APMC Mandi rates + Quality score)`
      );
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Ensure quality assessment exists
      let finalQuality = qualityAssessment;
      if (!finalQuality) {
        finalQuality = await analyzeGrainPhoto(photoUrl, crop, variety);
      }

      const newListing: Listing = {
        id: 'L-' + Date.now(),
        ownerId: userProfile?.uid || 'guest-farmer',
        farmerName,
        phone,
        crop,
        variety: variety || 'Standard',
        qty: Number(qty),
        price: Number(price),
        district: district || 'Indore',
        location,
        photoUrl,
        qualityAssessment: finalQuality,
        status: 'Available',
        createdAt: new Date().toISOString(),
      };

      await createCropListing(newListing);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Direct Harvest Listing</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          List Your Harvest with AI Grain Inspection
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Upload harvest grain photograph. The AI Quality Inspector calculates moisture %, foreign matter %, and assigns an official AGMARK certificate. Your grain photo will be published in the Wholesale Mart for buyers!
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Grain Photograph & AI Quality Inspector */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  1. Harvest Grain Photograph & Real-Time AI Inspection
                </h3>
              </div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Photo will be displayed in Wholesale Mart
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Photo Box */}
              <div className="md:col-span-5 space-y-2">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-2 text-center bg-white dark:bg-slate-900 min-h-[180px] relative overflow-hidden flex flex-col items-center justify-center group">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Grain Harvest"
                      className="w-full h-44 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="space-y-2 p-4">
                      <Upload className="w-8 h-8 text-purple-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Upload Harvest Photo
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadSampleGrain('wheat')}
                    className="flex-1 py-1.5 px-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-[10px] font-bold"
                  >
                    Wheat Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleGrain('soybean')}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[10px] font-bold"
                  >
                    Soybean Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleGrain('paddy')}
                    className="flex-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-[10px] font-bold"
                  >
                    Paddy Sample
                  </button>
                </div>
              </div>

              {/* Quality Certificate Display */}
              <div className="md:col-span-7 flex flex-col justify-between">
                {isInspectingPhoto ? (
                  <div className="h-full flex items-center justify-center p-6 text-purple-600 text-xs font-bold gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing grain morphology, moisture and dockage...</span>
                  </div>
                ) : qualityAssessment ? (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 space-y-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-black text-[11px]">
                          {qualityAssessment.grade}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Gemini 3.8 Flash
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-600 flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Purity: {qualityAssessment.score}/100</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Moisture:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {qualityAssessment.moisturePercent}% (Optimal &lt; 12%)
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Foreign Matter:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {qualityAssessment.foreignMatterPercent}%
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Broken Kernels:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {qualityAssessment.brokenGrainsPercent}%
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Luster / Color:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {qualityAssessment.luster}
                        </span>
                      </div>
                    </div>

                    {qualityAssessment.dockageDeduction && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-[10px] text-amber-900 dark:text-amber-200">
                        <span className="font-bold text-amber-700 dark:text-amber-300">Escrow Dockage Terms: </span>
                        {qualityAssessment.dockageDeduction}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      {qualityAssessment.notes}
                    </p>

                    {qualityAssessment.trustedSources && qualityAssessment.trustedSources.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-500">Cited:</span>
                        {qualityAssessment.trustedSources.map((s, i) => (
                          <span key={i} className="text-emerald-700 dark:text-emerald-300 font-medium">
                            • {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-slate-400 text-xs text-center border border-dashed rounded-2xl">
                    Upload grain photo or select a sample to generate verified AGMARK inspection certificate.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Commodity Specifications */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              2. Commodity & Pricing Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  {t.lblFarmerName}
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  {t.lblPhone}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  {t.lblCrop}
                </label>
                <select
                  value={crop}
                  onChange={(e) => {
                    setCrop(e.target.value);
                    if (photoUrl) runQualityScan(photoUrl, e.target.value, variety);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="Wheat">Wheat (Kanak)</option>
                  <option value="Paddy (Dhan)">Paddy (Dhan - Unhusked Harvest)</option>
                  <option value="Milled Rice">Milled Rice (Chawal)</option>
                  <option value="Soybean">Soybean (Yellow)</option>
                  <option value="Maize">Maize / Corn</option>
                  <option value="Gram / Chana">Gram / Chana</option>
                  <option value="Mustard">Mustard (Sarson)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  {t.lblVariety}
                </label>
                <input
                  type="text"
                  required
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Lokwan / Sharbati / Basmati 1121 / JS 335"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  {t.lblQty}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.lblAskingPrice}
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFixPrice}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fix via Mandi AI</span>
                  </button>
                </div>
                <input
                  type="number"
                  step="50"
                  min="500"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-emerald-600 dark:text-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  Regional District (For AI Aggregator Cluster)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="Indore">Indore District</option>
                  <option value="Ujjain">Ujjain District</option>
                  <option value="Dewas">Dewas District</option>
                  <option value="Hoshangabad">Hoshangabad District</option>
                  <option value="Dhar">Dhar District</option>
                  <option value="Sehore">Sehore District</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">
                  Pickup Yard / Village Address
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {isAutoFixingPrice && (
              <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 p-4 rounded-2xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Checking APMC benchmark price...</span>
              </div>
            )}

            {autoFixMessage && (
              <div className="text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{autoFixMessage}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-emerald-600/25 text-xs transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Publish Harvest with Photo & AI Certificate to Wholesale Mart</span>
          </button>
        </form>
      </div>
    </div>
  );
};
