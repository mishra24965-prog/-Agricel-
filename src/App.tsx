import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { FarmerDashboard } from './components/FarmerDashboard';
import { FarmerListingView } from './components/FarmerListingView';
import { BuyerDashboard } from './components/BuyerDashboard';
import { RegionalClusterView } from './components/RegionalClusterView';
import { MarketplaceView } from './components/MarketplaceView';
import { BuyerDemandsView } from './components/BuyerDemandsView';
import { WeighbridgeView } from './components/WeighbridgeView';
import { FreightTrackingView } from './components/FreightTrackingView';
import { GrievancesView } from './components/GrievancesView';
import { ProfileViewPage } from './components/ProfileViewPage';
import { GrainVisionModal } from './components/GrainVisionModal';
import { FloatingCopilot } from './components/FloatingCopilot';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { HowToOperateModal } from './components/HowToOperateModal';
import { FarmerRegistrationModal } from './components/FarmerRegistrationModal';
import { NavigationMenuDrawer } from './components/NavigationMenuDrawer';
import { BankOrUpiModal } from './components/BankOrUpiModal';
import {
  subscribeToListings,
  subscribeToOrders,
  subscribeToDemands,
  subscribeToGrievances,
  seedInitialDataIfEmpty,
  computeRegionalClusters,
  INITIAL_LISTINGS,
  INITIAL_ORDERS,
  INITIAL_DEMANDS,
  INITIAL_GRIEVANCES,
} from './services/db';
import type { Language } from './translations';
import { translations } from './translations';
import type { Listing, Order, Demand, Grievance, UserRole } from './types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

function MainContent() {
  const { userProfile, openAuthModal } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | 'workspace'>('home');
  const [activePortal, setActivePortal] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<string>('farmer-dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('agricel_theme') === 'dark' ||
      (!localStorage.getItem('agricel_theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('agricel_farmer_registered');
  });
  const [prefilledTrackingId, setPrefilledTrackingId] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Real-time Firestore state
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [demands, setDemands] = useState<Demand[]>(INITIAL_DEMANDS);
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const t = translations[language];

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agricel_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agricel_theme', 'light');
    }
  }, [darkMode]);

  // Initial Data Seeding and Real-time Firestore Subscriptions
  useEffect(() => {
    let isSubscribed = true;

    seedInitialDataIfEmpty().catch((err) => console.warn('Seeder catch:', err));

    const unsubListings = subscribeToListings((data) => {
      if (isSubscribed && data.length > 0) {
        setListings(data);
        setIsSynced(true);
      }
    });

    const unsubOrders = subscribeToOrders((data) => {
      if (isSubscribed && data.length > 0) {
        setOrders(data);
        setIsSynced(true);
      }
    });

    const unsubDemands = subscribeToDemands((data) => {
      if (isSubscribed && data.length > 0) {
        setDemands(data);
        setIsSynced(true);
      }
    });

    const unsubGrievances = subscribeToGrievances((data) => {
      if (isSubscribed && data.length > 0) {
        setGrievances(data);
        setIsSynced(true);
      }
    });

    return () => {
      isSubscribed = false;
      unsubListings();
      unsubOrders();
      unsubDemands();
      unsubGrievances();
    };
  }, []);

  // Sync user profile role with active portal when switched
  useEffect(() => {
    if (userProfile?.role) {
      setActivePortal(userProfile.role);
      // Auto-focus the primary dashboard for the role if not already on profile
      setActiveTab((prev) => {
        if (prev === 'profile') return 'profile';
        if (userProfile.role === 'farmer') return 'farmer-dashboard';
        if (userProfile.role === 'buyer') return 'buyer-dashboard';
        if (userProfile.role === 'logistics') return 'verification';
        if (userProfile.role === 'admin') return 'grievances';
        return 'farmer-dashboard';
      });
    }
  }, [userProfile?.role]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3800);
  };

  const handleNavigateTab = (tab: string, portal?: UserRole) => {
    if (portal) setActivePortal(portal);
    setCurrentView('workspace');
    setActiveTab(tab);
  };

  const handleTrackFromOrder = (trackingId: string) => {
    setPrefilledTrackingId(trackingId);
    setActivePortal('logistics');
    handleNavigateTab('logistics');
  };

  const handleOrderCreated = (trackingId: string) => {
    showToast(`100% Escrow Capital Secured in Vault! Tracking ID: ${trackingId}`);
    handleTrackFromOrder(trackingId);
  };

  const handleListingPublished = () => {
    showToast('Harvest successfully published with photo & AI certificate to Wholesale Mart!');
    handleNavigateTab('marketplace', 'farmer');
  };

  const handleWeighbridgeVerified = () => {
    showToast('Weighbridge Verified! Escrow automated bank payout disbursed.');
  };

  // Compute live AI Regional Clusters
  const clusters = computeRegionalClusters(listings, demands);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openVisionModal={() => setIsVisionModalOpen(true)}
        openGuideModal={() => setIsGuideModalOpen(true)}
        onOpenNavMenu={() => setIsNavMenuOpen(true)}
        isSynced={isSynced}
      />

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.div
            key="home-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex flex-col"
          >
            <HomeView
              language={language}
              onNavigate={(tab) => {
                if (tab === 'farmer-dashboard' || tab === 'farmer-listing') {
                  setActivePortal('farmer');
                } else if (tab === 'marketplace' || tab === 'buyer-demands') {
                  setActivePortal('buyer');
                }
                handleNavigateTab(tab);
              }}
              openVisionModal={() => setIsVisionModalOpen(true)}
              listings={listings}
              orders={orders}
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Main Scrollable Workspace Content - Full Width Dashboard without messy static sidebar */}
            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
              {/* Dedicated Profile View Page for All 4 Roles */}
              {activeTab === 'profile' ? (
                <ProfileViewPage
                  language={language}
                  activePortal={activePortal}
                  onNavigateTab={handleNavigateTab}
                />
              ) : (
                <>
                  {/* Farmer Portal Views */}
                  {activePortal === 'farmer' && (
                <>
                  {activeTab === 'farmer-dashboard' && (
                    <FarmerDashboard
                      language={language}
                      onNavigate={handleNavigateTab}
                      orders={orders}
                      listings={listings}
                      onTrackOrder={handleTrackFromOrder}
                      onOpenNavMenu={() => setIsNavMenuOpen(true)}
                      onOpenGuideModal={() => setIsGuideModalOpen(true)}
                      onOpenVisionModal={() => setIsVisionModalOpen(true)}
                    />
                  )}

                  {activeTab === 'farmer-listing' && (
                    <FarmerListingView
                      language={language}
                      onSuccess={handleListingPublished}
                    />
                  )}

                  {activeTab === 'marketplace' && (
                    <MarketplaceView
                      language={language}
                      listings={listings}
                      onOrderCreated={handleOrderCreated}
                    />
                  )}
                </>
              )}

              {/* Buyer Portal Views */}
              {activePortal === 'buyer' && (
                <>
                  {activeTab === 'buyer-dashboard' && (
                    <BuyerDashboard
                      language={language}
                      onNavigate={handleNavigateTab}
                      orders={orders}
                      demands={demands}
                      listings={listings}
                      clusters={clusters}
                      onOpenAggregator={() => handleNavigateTab('regional-clusters', 'buyer')}
                    />
                  )}

                  {activeTab === 'regional-clusters' && (
                    <RegionalClusterView
                      language={language}
                      clusters={clusters}
                      demands={demands}
                      onSelectListing={(listing) => {
                        handleNavigateTab('marketplace', 'buyer');
                      }}
                      onNavigate={handleNavigateTab}
                    />
                  )}

                  {activeTab === 'marketplace' && (
                    <MarketplaceView
                      language={language}
                      listings={listings}
                      onOrderCreated={handleOrderCreated}
                    />
                  )}

                  {activeTab === 'buyer-demands' && (
                    <BuyerDemandsView
                      language={language}
                      demands={demands}
                      onFulfill={() => handleNavigateTab('farmer-listing', 'farmer')}
                    />
                  )}
                </>
              )}

              {/* Weighbridge Station Views */}
              {activePortal === 'logistics' && (
                <>
                  {activeTab === 'verification' && (
                    <WeighbridgeView
                      language={language}
                      orders={orders}
                      onVerified={handleWeighbridgeVerified}
                    />
                  )}

                  {activeTab === 'logistics' && (
                    <FreightTrackingView
                      language={language}
                      orders={orders}
                      prefilledTrackingId={prefilledTrackingId}
                    />
                  )}
                </>
              )}

              {/* Management Arbitration Views */}
              {activePortal === 'admin' && (
                <>
                  {activeTab === 'grievances' && (
                    <GrievancesView
                      language={language}
                      grievances={grievances}
                      orders={orders}
                      onTicketUpdated={() =>
                        showToast('Tribunal desk updated with live Firestore records!')
                      }
                    />
                  )}
                </>
              )}
                </>
              )}
            </div>
          </main>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Floating Copilot with Gemini 3.8 Live Voice & Guide */}
      <FloatingCopilot
        language={language}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Interactive How to Operate Multi-Role Guide Modal */}
      <HowToOperateModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        language={language}
        onNavigateTab={(tab, portal) => {
          handleNavigateTab(tab, portal);
          showToast(
            language === 'hi'
              ? `${portal} वर्कस्पेस पर नेविगेट किया गया`
              : `Navigated to ${portal} workspace`
          );
        }}
        onOpenVoiceCopilot={() => {
          setIsGuideModalOpen(false);
        }}
      />

      {/* Grain Vision Inspector Modal */}
      <GrainVisionModal
        language={language}
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        onApplyToListing={(photoUrl, quality) => {
          handleNavigateTab('farmer-listing', 'farmer');
        }}
      />

      {/* Auth & Role Switcher Modal */}
      <AuthModal language={language} />

      {/* Personalized Profile Settings Modal */}
      <ProfileModal language={language} activePortal={activePortal} />

      {/* Navigation Menu Drawer (Three-Lines Menu) */}
      <NavigationMenuDrawer
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isSynced={isSynced}
        currentView={currentView}
        setCurrentView={setCurrentView}
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        activeTab={activeTab}
        onNavigateTab={(tab, portal) => {
          handleNavigateTab(tab, portal);
        }}
        onOpenVisionModal={() => setIsVisionModalOpen(true)}
        onOpenBankModal={() => setIsBankModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenAuthModal={openAuthModal}
        onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)}
      />

      {/* Mandatory First-Step Farmer Registration with Passport Photo & Camera */}
      <FarmerRegistrationModal
        isOpen={isRegistrationModalOpen}
        language={language}
        onRegistered={() => {
          localStorage.setItem('agricel_farmer_registered', 'true');
          setIsRegistrationModalOpen(false);
          setCurrentView('workspace');
          setActivePortal('farmer');
          setActiveTab('farmer-dashboard');
          showToast(
            language === 'hi'
              ? 'किसान पंजीकरण व फोटो सत्यापन सफल!'
              : 'Farmer KYC Registration Successful!'
          );
        }}
      />

      {/* Dedicated Bank Accounts & UPI Management Modal (Accessed from Menu) */}
      <BankOrUpiModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        language={language}
        activePortal={activePortal}
        onSuccess={() => {
          showToast(
            language === 'hi'
              ? 'बैंक खाता विवरण सफलतापूर्वक अपडेट हुआ'
              : 'Payout destination updated successfully'
          );
        }}
      />

      {/* Animated Toast Notifications */}
      <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="px-5 py-3.5 rounded-2xl border shadow-xl text-xs font-bold flex items-center gap-3 bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/95 dark:text-emerald-100 dark:border-emerald-800 pointer-events-auto"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
