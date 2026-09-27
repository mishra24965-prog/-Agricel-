import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  FileCheck2,
  Scan,
  Volume2,
  VolumeX,
  ShieldCheck,
  Info,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { analyzeGrainPhoto } from '../services/qualityEngine';
import type { Language } from '../translations';
import { translations, getSpeechLangCode } from '../translations';
import type { QualityAssessment } from '../types';

interface GrainVisionModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onApplyToListing?: (photoUrl: string, quality: QualityAssessment) => void;
}

export const GrainVisionModal: React.FC<GrainVisionModalProps> = ({
  language,
  isOpen,
  onClose,
  onApplyToListing,
}) => {
  const _t = translations[language];

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  );
  const [crop, setCrop] = useState('Wheat');
  const [variety, setVariety] = useState('Lokwan Grade-A');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<QualityAssessment | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const url = evt.target?.result as string;
        setPreviewUrl(url);
        setAnalysisResult(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSample = (sampleType: 'wheat' | 'soybean' | 'paddy') => {
    setAnalysisError(null);
    if (sampleType === 'wheat') {
      setCrop('Wheat');
      setVariety('Lokwan Benchmark');
      setPreviewUrl(
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
      );
    } else if (sampleType === 'soybean') {
      setCrop('Soybean');
      setVariety('JS 335 Certified');
      setPreviewUrl(
        'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
      );
    } else {
      setCrop('Paddy (Dhan)');
      setVariety('Basmati 1121');
      setPreviewUrl(
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
      );
    }
    setAnalysisResult(null);
  };

  const handleRunAnalysis = async () => {
    if (!previewUrl) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeGrainPhoto(previewUrl, crop, variety);
      setAnalysisResult(result);
      setAnalysisError(null);
    } catch (err: any) {
      console.warn('AI Vision call encountered an error:', err);
      setAnalysisError(
        err?.message || 'Unable to connect to Gemini AI Vision API. Tap retry below or re-upload a clear photo.'
      );
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakReport = () => {
    if (!analysisResult) return;
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    switch (language) {
      case 'hi':
      case 'bho':
        speechText = `अनाज गुणवत्ता रिपोर्ट: फसल ${crop}, ग्रेड ${analysisResult.grade} है। शुद्धता स्कोर ${analysisResult.score} अंक है। कचरा मात्र ${analysisResult.foreignMatterPercent} प्रतिशत, टूटे दाने ${analysisResult.brokenGrainsPercent} प्रतिशत है। दाने की चमक ${analysisResult.luster} है। यह फसल एगमार्क मानक के अनुसार जांची गई है।`;
        break;
      case 'pa':
        speechText = `ਅਨਾਜ ਜਾਂਚ ਰਿਪੋਰਟ: ਫ਼ਸਲ ${crop}, ਗ੍ਰੇਡ ${analysisResult.grade} ਹੈ। ਸ਼ੁੱਧਤਾ ਸਕੋਰ ${analysisResult.score} ਅੰਕ ਹੈ। ਕਚਰਾ ${analysisResult.foreignMatterPercent} ਪ੍ਰਤੀਸ਼ਤ ਅਤੇ ਟੁੱਟੇ ਦਾਣੇ ${analysisResult.brokenGrainsPercent} ਪ੍ਰਤੀਸ਼ਤ ਹਨ।`;
        break;
      case 'mr':
        speechText = `धान्य गुणवत्ता अहवाल: पीक ${crop}, प्रत ${analysisResult.grade} आहे. शुद्धता गुण ${analysisResult.score} आहे. कचरा ${analysisResult.foreignMatterPercent} टक्के आणि फुटलेले दाणे ${analysisResult.brokenGrainsPercent} टक्के आहेत.`;
        break;
      case 'gu':
        speechText = `અનાજ ગુણવત્તા રિપોર્ટ: પાક ${crop}, ગ્રેડ ${analysisResult.grade} છે. શુદ્ધતા સ્કોર ${analysisResult.score} છે. કચરો ${analysisResult.foreignMatterPercent} ટકા અને તૂટેલા દાણા ${analysisResult.brokenGrainsPercent} ટકા છે.`;
        break;
      case 'te':
        speechText = `ధాన్య నాణ్యత నివేదిక: పంట ${crop}, గ్రేడ్ ${analysisResult.grade}. స్వచ్ఛత స్కోర్ ${analysisResult.score}. వ్యర్థాలు ${analysisResult.foreignMatterPercent} శాతం మరియు విరిగిన ధాన్యం ${analysisResult.brokenGrainsPercent} శాతం.`;
        break;
      case 'ta':
        speechText = `தானிய தர அறிக்கை: பயிர் ${crop}, தரம் ${analysisResult.grade}. தூய்மை மதிப்பெண் ${analysisResult.score}. கழிவு ${analysisResult.foreignMatterPercent} சதவீதம் மற்றும் உடைந்த தானியங்கள் ${analysisResult.brokenGrainsPercent} சதவீதம்.`;
        break;
      case 'kn':
        speechText = `ಧಾನ್ಯ ಗುಣಮಟ್ಟ ವರದಿ: ಬೆಳೆ ${crop}, ಗ್ರೇಡ್ ${analysisResult.grade}. ಶುದ್ಧತೆ ಸ್ಕೋರ್ ${analysisResult.score}. ಕಸ ${analysisResult.foreignMatterPercent} ಶೇಕಡಾ ಮತ್ತು ಒಡೆದ ಧಾನ್ಯಗಳು ${analysisResult.brokenGrainsPercent} ಶೇಕಡಾ.`;
        break;
      case 'bn':
        speechText = `শস্য গুণমান রিপোর্ট: ফসল ${crop}, গ্রেড ${analysisResult.grade}। বিশুদ্ধতা স্কোর ${analysisResult.score}। বর্জ্য ${analysisResult.foreignMatterPercent} শতাংশ এবং ভাঙা দানা ${analysisResult.brokenGrainsPercent} শতাংশ।`;
        break;
      case 'or':
        speechText = `ଶସ୍ୟ ଗୁଣବତ୍ତା ରିପୋର୍ଟ: ଫସଲ ${crop}, ଗ୍ରେଡ୍ ${analysisResult.grade}। ଶୁଦ୍ଧତା ସ୍କୋର ${analysisResult.score}। ଅଳିଆ ${analysisResult.foreignMatterPercent} ପ୍ରତିଶତ ଏବଂ ଭଙ୍ଗା ଦାନା ${analysisResult.brokenGrainsPercent} ପ୍ରତିଶତ।`;
        break;
      case 'ml':
        speechText = `ധാന്യ ഗുണനിലവാര റിപ്പോർട്ട്: വിള ${crop}, ഗ്രേഡ് ${analysisResult.grade}. ശുദ്ധി സ്കോർ ${analysisResult.score}. മാലിന്യം ${analysisResult.foreignMatterPercent} ശതമാനവും പൊട്ടിയ ധാന്യങ്ങൾ ${analysisResult.brokenGrainsPercent} ശതമാനവും.`;
        break;
      case 'en':
      default:
        speechText = `Grain Quality Inspection Report: Crop ${crop}, Grade is ${analysisResult.grade}. Optical Purity score is ${analysisResult.score} out of 100. Foreign matter is ${analysisResult.foreignMatterPercent} percent, broken kernels are ${analysisResult.brokenGrainsPercent} percent, and luster is ${analysisResult.luster}. Certified according to standard.`;
        break;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = getSpeechLangCode(language);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto relative"
      >
        <button
          onClick={() => {
            if (isSpeaking) window.speechSynthesis.cancel();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner">
            <Camera className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Grain Optical Quality Inspector</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                AGMARK Calibrated
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual Purity, Broken Grains, Shriveled Seeds & Foreign Dockage Check
            </p>
          </div>
        </div>

        {/* Informational Banner on Moisture vs Optical */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="font-extrabold text-amber-800 dark:text-amber-300">Optical Grading Notice:</strong> Camera photos accurately inspect surface purity, broken seeds, shriveled grains, and foreign matter. Moisture is measured separately on-site with a certified digital meter at the weighbridge scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Grain Snapshot with Optical Scanning Line */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>1. Harvest Grain Snapshot</span>
              <span className="text-[10px] text-purple-600 font-bold">RGB Optical Feed</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-2 text-center bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center min-h-[190px] relative overflow-hidden group shadow-inner">
              {previewUrl ? (
                <div className="relative w-full h-48 overflow-hidden rounded-xl">
                  <img
                    src={previewUrl}
                    alt="Grain Specimen"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* High-Tech Animated Optical Laser Scanner when Analyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none bg-purple-950/20">
                      {/* Laser Bar */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#a855f7] animate-scanline" />
                      {/* Central Radar Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scan className="w-16 h-16 text-purple-300/80 animate-spin opacity-80" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-purple-300 text-center animate-pulse">
                        Scanning grain optics • Visual purity & dockage analysis...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  <Upload className="w-8 h-8 text-purple-500 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Grain Photo
                  </p>
                  <p className="text-[10px] text-slate-400">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => loadSample('wheat')}
                className="flex-1 py-1.5 px-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-[10px] font-bold hover:bg-amber-100 transition-colors"
              >
                Wheat Lokwan
              </button>
              <button
                type="button"
                onClick={() => loadSample('soybean')}
                className="flex-1 py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[10px] font-bold hover:bg-emerald-100 transition-colors"
              >
                Soybean JS335
              </button>
              <button
                type="button"
                onClick={() => loadSample('paddy')}
                className="flex-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-colors"
              >
                Paddy Basmati
              </button>
            </div>
          </div>

          {/* Specification & Trigger */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                2. Crop Specification
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
              >
                <option value="Wheat">Wheat</option>
                <option value="Paddy (Dhan)">Paddy (Dhan)</option>
                <option value="Milled Rice">Milled Rice</option>
                <option value="Soybean">Soybean</option>
                <option value="Mustard">Mustard</option>
                <option value="Maize">Maize</option>
                <option value="Gram / Chana">Gram / Chana</option>
              </select>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="Variety (e.g. Lokwan Grade-A)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-slate-100"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isAnalyzing ? 'Inspecting Grain Optics...' : 'Run Optical AI Inspection'}</span>
            </motion.button>
          </div>
        </div>

        {/* Fallback & Retry Display on Connection / AI Error */}
        <AnimatePresence>
          {analysisError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs text-amber-900 dark:text-amber-200">
                    Connection / AI Vision Notice
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    {analysisError}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Retry AI Inspection</span>
                </button>

                <label className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-purple-600" />
                  <span>Re-upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Box with AnimatePresence */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full bg-purple-600 text-white font-black text-xs self-start shadow-sm">
                    {analysisResult.grade}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>AGMARK Grade-1 Matched</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Read-Aloud Voice Button for Accessibility / Low-Literacy Support */}
                  <button
                    type="button"
                    onClick={handleSpeakReport}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                      isSpeaking
                        ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 text-amber-800 dark:text-amber-200'
                        : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                    }`}
                    title="Listen to quality report / रिपोर्ट सुनें"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>🔊 Listen / रिपोर्ट सुनें</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Purity: {analysisResult.score}/100</span>
                  </span>
                </div>
              </div>

              {/* 4 True Optical Inspection Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 shadow-xs">
                  <span className="text-slate-400 block text-[10px]">Foreign Matter:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {analysisResult.foreignMatterPercent}%
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 shadow-xs">
                  <span className="text-slate-400 block text-[10px]">Broken Kernels:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {analysisResult.brokenGrainsPercent}%
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 shadow-xs">
                  <span className="text-slate-400 block text-[10px]">Shriveled Grains:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {analysisResult.shriveledPercent}%
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 shadow-xs">
                  <span className="text-slate-400 block text-[10px]">Grain Luster:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {analysisResult.luster}
                  </span>
                </div>
              </div>

              {/* Detected Traits & Dockage Adjustment */}
              {analysisResult.dockageDeduction && (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs flex items-start gap-2">
                  <span className="text-amber-700 dark:text-amber-300 font-extrabold text-[11px] shrink-0">
                    Escrow Dockage Terms:
                  </span>
                  <span className="text-amber-900 dark:text-amber-200 font-medium text-[11px]">
                    {analysisResult.dockageDeduction}
                  </span>
                </div>
              )}

              {analysisResult.agronomicAdvice && (
                <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs flex items-start gap-2">
                  <span className="text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] shrink-0">
                    Post-Harvest Advice:
                  </span>
                  <span className="text-emerald-900 dark:text-emerald-200 font-medium text-[11px]">
                    {analysisResult.agronomicAdvice}
                  </span>
                </div>
              )}

              {/* Inspector Observations & Standard Compliance */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Standard: {analysisResult.agmarkStandard}
                  </span>
                  {analysisResult.confidenceScore && (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                      Optical Confidence: {(analysisResult.confidenceScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {analysisResult.notes}
                </p>

                {/* Trusted Source Citations */}
                {analysisResult.trustedSources && analysisResult.trustedSources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Trusted Regulatory Authorities Cited:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.trustedSources.map((src, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{src}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {onApplyToListing && previewUrl && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    onApplyToListing(previewUrl, analysisResult);
                    onClose();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Attach this AI Certificate to Harvest Listing</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
