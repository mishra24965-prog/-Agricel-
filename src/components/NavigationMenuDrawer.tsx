import React from 'react';
import {
  X,
  LayoutDashboard,
  Wheat,
  Store,
  Camera,
  Truck,
  Building2,
  User,
  BookOpen,
  ArrowLeftRight,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap,
  CreditCard,
  Tractor,
  Scale,
  Home,
  Moon,
  Sun,
  CloudCheck,
  Megaphone,
  UserCheck,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import type { UserRole } from '../types';

interface NavigationMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage?: (lang: Language) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  isSynced?: boolean;
  currentView: 'home' | 'workspace';
  setCurrentView: (view: 'home' | 'workspace') => void;
  activePortal: UserRole;
  setActivePortal: (portal: UserRole) => void;
  activeTab: string;
  onNavigateTab: (tab: string, portal?: UserRole) => void;
  onOpenVisionModal: () => void;
  onOpenBankModal: () => void;
  onOpenGuideModal: () => void;
  onOpenAuthModal: () => void;
  onOpenRegistrationModal?: () => void;
}

export const NavigationMenuDrawer: React.FC<NavigationMenuDrawerProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  isSynced,
  currentView,
  setCurrentView,
  activePortal,
  setActivePortal,
  activeTab,
  onNavigateTab,
  onOpenVisionModal,
  onOpenBankModal,
  onOpenGuideModal,
  onOpenAuthModal,
  onOpenRegistrationModal,
}) => {
  const { userProfile, logout } = useAuth();
  const isHindi = language === 'hi';

  if (!isOpen) return null;

  const currentRole = activePortal || userProfile?.role || 'farmer';
  const payment = userProfile?.paymentDetails;
  const isUpi = payment?.method === 'upi';

  // 1. Farmer Portal Menu Items
  const farmerMenuItems = [
    {
      id: 'farmer-dashboard',
      label: isHindi ? 'डैशबोर्ड' : 'Dashboard',
      desc: isHindi ? 'निपटान भुगतान, एस्क्रो लेज़र व मंडी स्थिति' : 'Settled payouts, escrow ledger & mandi status',
      icon: LayoutDashboard,
      badge: isHindi ? 'मुख्य' : 'Desk',
      onClick: () => {
        onNavigateTab('farmer-dashboard', 'farmer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'farmer-dashboard' && activePortal === 'farmer',
    },
    {
      id: 'farmer-listing',
      label: isHindi ? 'फसल लॉट सूचीबद्ध करें' : 'List Harvest Crop',
      desc: isHindi ? 'थोक मिलर्स व खरीदारों हेतु नया अनाज लॉट बनाएं' : 'Publish AGMARK-graded harvest lot for millers',
      icon: Wheat,
      badge: isHindi ? 'नया' : 'List Lot',
      onClick: () => {
        onNavigateTab('farmer-listing', 'farmer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'farmer-listing',
    },
    {
      id: 'marketplace',
      label: isHindi ? 'थोक अनाज मंडी' : 'Wholesale Grain Mart',
      desc: isHindi ? 'लाइव खरीदार मांग, एपीएमसी भाव व अनाज लॉट' : 'Browse buyer bids, live RFQs & verified lots',
      icon: Store,
      badge: 'Live APMC',
      onClick: () => {
        onNavigateTab('marketplace', 'farmer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'marketplace',
    },
    {
      id: 'vision',
      label: isHindi ? 'एआई अनाज गुणवत्ता स्कैनर' : 'AI Grain Inspector',
      desc: isHindi ? 'एआई से शुद्धता, टूटे दाने व एगमार्क ग्रेड जांच' : 'Optical defects, broken seeds & AGMARK grading',
      icon: Camera,
      badge: 'AI Vision',
      onClick: () => {
        onClose();
        onOpenVisionModal();
      },
      isActive: false,
    },
    {
      id: 'registration',
      label: isHindi ? 'किसान पंजीकरण व सत्यापन' : 'Farmer Registration & KYC',
      desc: isHindi ? 'भूमि खसरा, आधार/केवाईसी व एफपीओ सदस्यता' : 'Land records, Kisan ID #MP-IND-2026 & KYC',
      icon: ShieldCheck,
      badge: isHindi ? 'सत्यापित' : 'KYC',
      onClick: () => {
        onClose();
        if (onOpenRegistrationModal) onOpenRegistrationModal();
      },
      isActive: false,
    },
    {
      id: 'profile',
      label: isHindi ? 'किसान प्रोफ़ाइल व बैंक खाता' : 'Farmer Profile & Bank',
      desc: isHindi ? '६०-सेकंड सीधे बैंक भुगतान गंतव्य' : 'Bank escrow destination & farmer details',
      icon: User,
      badge: 'NPCI',
      onClick: () => {
        onNavigateTab('profile', 'farmer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'profile',
    },
  ];

  // 2. Buyer Portal Menu Items
  const buyerMenuItems = [
    {
      id: 'buyer-dashboard',
      label: isHindi ? 'डैशबोर्ड' : 'Dashboard',
      desc: isHindi ? 'खरीद व्यय, एस्क्रो वॉल्ट व ऑर्डर लेज़र' : 'Procurement expense, escrow vault & active orders',
      icon: LayoutDashboard,
      badge: isHindi ? 'मुख्य' : 'Hub',
      onClick: () => {
        onNavigateTab('buyer-dashboard', 'buyer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'buyer-dashboard' && activePortal === 'buyer',
    },
    {
      id: 'marketplace',
      label: isHindi ? 'थोक अनाज मंडी' : 'Wholesale Grain Mart',
      desc: isHindi ? 'सत्यापित किसान लॉट खोजें व खरीदें' : 'Browse certified farmer harvest lots & place bids',
      icon: Store,
      badge: 'Live APMC',
      onClick: () => {
        onNavigateTab('marketplace', 'buyer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'marketplace',
    },
    {
      id: 'buyer-demands',
      label: isHindi ? 'खरीदार मांग व आरएफक्यू (RFQs)' : 'Post & Manage RFQs',
      desc: isHindi ? 'मिलों हेतु थोक अनाज खरीद मांग जारी करें' : 'Publish bulk demand notices for regional FPOs',
      icon: Megaphone,
      badge: 'RFQs',
      onClick: () => {
        onNavigateTab('buyer-demands', 'buyer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'buyer-demands',
    },
    {
      id: 'regional-clusters',
      label: isHindi ? 'एआई क्षेत्रीय संकलन केंद्र' : 'AI Regional Aggregator',
      desc: isHindi ? 'मालवा व मध्य भारत एआई लॉजिस्टिक्स क्लस्टर' : 'Multi-farmer bulk consolidation for freight savings',
      icon: Sparkles,
      badge: 'AI Smart',
      onClick: () => {
        onNavigateTab('regional-clusters', 'buyer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'regional-clusters',
    },
    {
      id: 'profile',
      label: isHindi ? 'खरीदार प्रोफ़ाइल व एस्क्रो वॉल्ट' : 'Buyer Profile & Escrow',
      desc: isHindi ? 'जीएसटी, कॉरपोरेट क्रेडेंशियल व एस्क्रो डिपॉजिट' : 'Corporate GST, mandi license & escrow deposit',
      icon: User,
      badge: 'GST',
      onClick: () => {
        onNavigateTab('profile', 'buyer');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'profile',
    },
  ];

  // 3. Logistics / Weighbridge Menu Items
  const logisticsMenuItems = [
    {
      id: 'verification',
      label: isHindi ? 'डैशबोर्ड' : 'Dashboard',
      desc: isHindi ? 'तौल पुल पर्ची प्रमाणीकरण व ऑटो-पेआउट' : 'Weighbridge scale slips & 60-sec escrow payout',
      icon: LayoutDashboard,
      badge: isHindi ? 'मुख्य' : 'Terminal',
      onClick: () => {
        onNavigateTab('verification', 'logistics');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'verification',
    },
    {
      id: 'logistics',
      label: isHindi ? 'फ्रेट टेलीमेट्री ट्रैकिंग' : 'Freight Telemetry Tracking',
      desc: isHindi ? 'ट्रक जीपीएस, रूट सुरक्षा व ई-वे बिल' : 'Live truck GPS, weighbridge telemetry & manifests',
      icon: Truck,
      badge: 'GPS Live',
      onClick: () => {
        onNavigateTab('logistics', 'logistics');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'logistics',
    },
    {
      id: 'vision',
      label: isHindi ? 'एआई अनाज गुणवत्ता स्कैनर' : 'AI Grain Inspector',
      desc: isHindi ? 'तौल पुल पर नमी व ग्रेड सत्यापन' : 'Verify physical sample at gate inspection',
      icon: Camera,
      badge: 'Gate QA',
      onClick: () => {
        onClose();
        onOpenVisionModal();
      },
      isActive: false,
    },
    {
      id: 'profile',
      label: isHindi ? 'स्टेशन क्रेडेंशियल' : 'Station Credentials',
      desc: isHindi ? 'तौल पुल लाइसेंस व डिजिटल सील' : 'APMC certified scale registration & ledger key',
      icon: User,
      badge: 'Scale ID',
      onClick: () => {
        onNavigateTab('profile', 'logistics');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'profile',
    },
  ];

  // 4. Admin / Arbitration Menu Items
  const adminMenuItems = [
    {
      id: 'grievances',
      label: isHindi ? 'डैशबोर्ड' : 'Dashboard',
      desc: isHindi ? 'मध्यस्थता न्यायाधिकरण व विवाद समाधान' : 'Arbitration desk, dispute tickets & vault audit',
      icon: LayoutDashboard,
      badge: isHindi ? 'मुख्य' : 'Tribunal',
      onClick: () => {
        onNavigateTab('grievances', 'admin');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'grievances',
    },
    {
      id: 'vision',
      label: isHindi ? 'एआई ग्रेड ऑडिट' : 'AI Grain Audit',
      desc: isHindi ? 'विवादित अनाज नमूनों का द्वितीयक सत्यापन' : 'Secondary inspection for disputed dockage claims',
      icon: Camera,
      badge: 'Audit',
      onClick: () => {
        onClose();
        onOpenVisionModal();
      },
      isActive: false,
    },
    {
      id: 'profile',
      label: isHindi ? 'मध्यस्थ क्रेडेंशियल' : 'Arbitrator Credentials',
      desc: isHindi ? 'न्यायाधिकरण प्राधिकरण व ऑडिट लॉग' : 'Institutional oversight credentials & signing key',
      icon: User,
      badge: 'Legal',
      onClick: () => {
        onNavigateTab('profile', 'admin');
        onClose();
      },
      isActive: currentView === 'workspace' && activeTab === 'profile',
    },
  ];

  // Pick menu items depending on current active portal
  const currentMenuItems =
    currentRole === 'buyer'
      ? buyerMenuItems
      : currentRole === 'logistics'
      ? logisticsMenuItems
      : currentRole === 'admin'
      ? adminMenuItems
      : farmerMenuItems;

  const currentPortalName =
    currentRole === 'buyer'
      ? (isHindi ? 'खरीदार पोर्टल' : 'Buyer Procurement Hub')
      : currentRole === 'logistics'
      ? (isHindi ? 'तौल पुल टर्मिनल' : 'Weighbridge Terminal')
      : currentRole === 'admin'
      ? (isHindi ? 'मध्यस्थता डेस्क' : 'Arbitration Tribunal')
      : (isHindi ? 'किसान पोर्टल' : 'Farmer Portal');

  return (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div className="relative z-10 w-84 sm:w-96 max-w-[88vw] bg-white dark:bg-slate-900 h-full shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
        {/* Top Header of Menu Drawer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-amber-300 shadow-inner">
              {currentRole === 'farmer' && <Tractor className="w-5 h-5 text-emerald-300" />}
              {currentRole === 'buyer' && <Store className="w-5 h-5 text-blue-300" />}
              {currentRole === 'logistics' && <Scale className="w-5 h-5 text-purple-300" />}
              {currentRole === 'admin' && <ShieldCheck className="w-5 h-5 text-rose-300" />}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">{currentPortalName}</h3>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                {isHindi ? 'पोर्टल संचालन व नेविगेशन' : 'Portal Operations & Menu'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Card with Photo & Language Switcher */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0 bg-slate-200">
              <img
                src={
                  userProfile?.photoUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                }
                alt={userProfile?.displayName || 'User'}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-emerald-700/95 text-[7px] font-black text-white text-center py-0.2">
                VERIFIED
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {userProfile?.displayName || (currentRole === 'farmer' ? 'Rajesh Kumar' : 'Agricel Member')}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {currentRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {userProfile?.organization || 'Malwa Organic Farmers Producer Co.'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {userProfile?.district || 'Indore District, MP'}
              </p>
            </div>
          </div>

          {/* Language Switcher moved under Menu */}
          {setLanguage && (
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-black text-emerald-700 dark:text-emerald-300 shadow-2xs flex items-center gap-1.5 shrink-0 transition-all hover:scale-105"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>
          )}
        </div>

        {/* Navigation Items List for Active Portal */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isHindi ? 'पोर्टल नेविगेशन' : 'Portal Navigation'}
          </div>

          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                  item.isActive
                    ? 'bg-emerald-600 text-white shadow-md font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black truncate">{item.label}</span>
                      {item.badge && !item.isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] truncate mt-0.5 ${
                        item.isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    item.isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}

          {/* Section: Switch Role / Portal */}
          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isHindi ? 'पोर्टल बदलें (Switch Portal)' : 'Switch Portal / Role'}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button
                onClick={() => {
                  onNavigateTab('farmer-dashboard', 'farmer');
                  onClose();
                }}
                className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentRole === 'farmer'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Tractor className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{isHindi ? 'किसान' : 'Farmer'}</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('buyer-dashboard', 'buyer');
                  onClose();
                }}
                className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentRole === 'buyer'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-800 dark:text-blue-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{isHindi ? 'खरीदार' : 'Buyer'}</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('verification', 'logistics');
                  onClose();
                }}
                className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentRole === 'logistics'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-800 dark:text-purple-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{isHindi ? 'तौल पुल' : 'Weighbridge'}</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('grievances', 'admin');
                  onClose();
                }}
                className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  currentRole === 'admin'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{isHindi ? 'मध्यस्थता' : 'Arbitrator'}</span>
              </button>
            </div>
          </div>

          {/* Section: System Utilities & Tools */}
          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isHindi ? 'टूल्स व सेटिंग्स' : 'Tools & Utilities'}
            </div>

            {/* Return to Public Overview */}
            <button
              onClick={() => {
                setCurrentView('home');
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs font-bold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-slate-500" />
                <span>{isHindi ? 'मुख्य सार्वजनिक अवलोकन (Overview)' : 'Main Public Overview (Home)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dark Mode Toggle inside Menu */}
            {setDarkMode && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                  <span>{isHindi ? 'डार्क / लाइट मोड' : 'Dark / Light Theme'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {darkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            )}

            {/* Cloud Sync Status */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-2 font-medium">
                <CloudCheck className="w-4 h-4 text-emerald-500" />
                <span>Firestore Cloud Sync</span>
              </span>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active 100%</span>
              </span>
            </div>

            {/* How to Operate Guide (Placed at the very last in Menu) */}
            <button
              onClick={() => {
                onClose();
                onOpenGuideModal();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-300/80 dark:border-emerald-800 hover:border-emerald-500 text-emerald-950 dark:text-emerald-200 flex items-center justify-between text-xs font-black transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-black text-xs leading-tight">
                    {isHindi ? 'संचालन गाइड (How to Operate)' : 'How to Operate (Step Guide)'}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {isHindi ? 'कहाँ जाएं व क्या करें (संपूर्ण वर्कफ़्लो)' : 'Where to go & what to do walkthrough'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold shadow-2xs group-hover:scale-105 transition-transform">
                {isHindi ? 'गाइड' : 'Guide'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Actions: Switch Account / Sign Out */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'खाता बदलें' : 'Switch Account'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHindi ? 'लॉगआउट' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
