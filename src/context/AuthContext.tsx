import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { subscribeToUserProfile, saveUserProfile } from '../services/db';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogleAuth: () => Promise<void>;
  signInDemoUser: (
    role: UserRole,
    customName?: string,
    phone?: string,
    customPaymentMethod?: 'bank' | 'upi',
    customPaymentAccount?: string,
    customIfsc?: string
  ) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_LOCAL_KEY = 'agricel_demo_profile_v2';
const DEFAULT_PASSPORT_PHOTO =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Listen to Firestore profile
        const unsubscribeProfile = subscribeToUserProfile(user.uid, async (profile) => {
          if (profile) {
            setUserProfile(profile);
          } else {
            // First time sign-in, initialize default profile with bank details for farmer
            const newProfile: UserProfile = getDefaultFarmerProfile(user.uid);
            newProfile.displayName = user.displayName || 'Rajesh Kumar (Malwa FPO)';
            newProfile.email = user.email || 'farmer@agricel.io';
            if (user.phoneNumber) newProfile.phone = user.phoneNumber;

            await saveUserProfile(newProfile);
            setUserProfile(newProfile);
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        // Check for local demo profile if not logged into Firebase Auth
        const savedDemo = localStorage.getItem(DEMO_LOCAL_KEY);
        if (savedDemo) {
          try {
            setUserProfile(JSON.parse(savedDemo));
          } catch {
            setUserProfile(getDefaultFarmerProfile('demo-farmer'));
          }
        } else {
          const defaultProf = getDefaultFarmerProfile('demo-farmer');
          setUserProfile(defaultProf);
          localStorage.setItem(DEMO_LOCAL_KEY, JSON.stringify(defaultProf));
        }
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  function getDefaultFarmerProfile(uid: string): UserProfile {
    return {
      uid,
      displayName: 'Rajesh Kumar (Malwa FPO)',
      email: 'rajesh.malwa@agricel.io',
      role: 'farmer',
      phone: '+91 98260 11223',
      organization: 'Malwa Organic Farmers Producer Co.',
      district: 'Indore District, MP',
      photoUrl: DEFAULT_PASSPORT_PHOTO,
      isRegistered: true,
      bankAccountLast4: '4821',
      paymentDetails: {
        method: 'bank',
        bankName: 'State Bank of India (SBI)',
        accountHolderName: 'Rajesh Kumar (Malwa FPO)',
        accountNumber: '308944514821',
        ifscCode: 'SBIN0001234',
        accountType: 'KCC (Kisan Credit Card)',
        upiId: '9826011223@oksbi',
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const signInWithGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      console.error('Google Sign In failed:', err);
      // Fallback: anonymous sign-in or demo sign-in if popup is blocked in iframe
      try {
        await signInAnonymously(auth);
        setIsAuthModalOpen(false);
      } catch (anonErr) {
        console.warn('Anonymous fallback sign in failed:', anonErr);
      }
    }
  };

  const signInDemoUser = async (
    role: UserRole,
    customName?: string,
    phone?: string,
    customPaymentMethod: 'bank' | 'upi' = 'bank',
    customPaymentAccount?: string,
    customIfsc?: string
  ) => {
    const namesByRole: Record<UserRole, string> = {
      farmer: customName || 'Rajesh Kumar (Malwa FPO)',
      buyer: customName || 'AgroProcure Wholesale Mills',
      logistics: customName || 'Indore Certified Weighbridge #4',
      admin: customName || 'Agricel Management Tribunal Officer',
    };
    const phonesByRole: Record<UserRole, string> = {
      farmer: phone || '+91 98260 11223',
      buyer: phone || '+91 98930 55443',
      logistics: phone || '+91 94250 11990',
      admin: phone || '+91 80000 12345',
    };
    const orgsByRole: Record<UserRole, string> = {
      farmer: 'Malwa Organic FPO',
      buyer: 'AgroProcure Wholesale Mills',
      logistics: 'MP Weighbridge Terminal Authority',
      admin: 'Agricel Escrow Governance Desk',
    };

    const isFarmer = role === 'farmer';
    const isBuyer = role === 'buyer';
    const isWeighbridge = role === 'logistics';
    const isArbitrator = role === 'admin';

    const updated: UserProfile = {
      uid: currentUser ? currentUser.uid : `demo-${role}-${Date.now().toString().slice(-4)}`,
      displayName: namesByRole[role],
      email: `${role}@agricel.io`,
      role,
      phone: phonesByRole[role],
      organization: orgsByRole[role],
      district: 'Indore District, MP',
      photoUrl: userProfile?.photoUrl || DEFAULT_PASSPORT_PHOTO,
      isRegistered: true,
      // ONLY Farmer and Buyer get bank/payment details:
      paymentDetails: isFarmer
        ? {
            method: customPaymentMethod,
            bankName: 'State Bank of India (SBI)',
            accountHolderName: namesByRole.farmer,
            accountNumber: customPaymentMethod === 'bank' ? (customPaymentAccount || '308944514821') : '',
            ifscCode: customIfsc || 'SBIN0001234',
            accountType: 'KCC (Kisan Credit Card)',
            upiId: customPaymentMethod === 'upi' ? (customPaymentAccount || '9826011223@oksbi') : '9826011223@oksbi',
            isVerified: true,
            verifiedAt: new Date().toISOString(),
          }
        : isBuyer
        ? {
            method: customPaymentMethod,
            bankName: 'HDFC Bank',
            accountHolderName: namesByRole.buyer,
            accountNumber: customPaymentMethod === 'bank' ? (customPaymentAccount || '50200049219901') : '',
            ifscCode: customIfsc || 'HDFC0000456',
            accountType: 'Current',
            upiId: customPaymentMethod === 'upi' ? (customPaymentAccount || 'procure.mills@okhdfcbank') : 'procure.mills@okhdfcbank',
            isVerified: true,
            verifiedAt: new Date().toISOString(),
          }
        : undefined,
      bankAccountLast4: isFarmer ? '4821' : isBuyer ? '9901' : undefined,
      // Operational details for Weighbridge (NO bank details!):
      weighbridgeStationId: isWeighbridge ? 'WB-MP-IND-04' : undefined,
      logisticsLicense: isWeighbridge ? 'MP-MANDI-WB-2024-912' : undefined,
      mandiYard: isWeighbridge ? 'Sanwer Road Platform Gate #2' : undefined,
      logisticsCapacity: isWeighbridge ? '60-Ton Electronic Pitless' : undefined,
      // Regulatory details for Arbitrator (NO bank details!):
      arbitratorAuthorityId: isArbitrator ? 'ARB-AGRI-MP-2026-88' : undefined,
      arbitratorDesignation: isArbitrator ? 'Certified Agricultural Contract Arbitrator' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updated);
    localStorage.setItem(DEMO_LOCAL_KEY, JSON.stringify(updated));

    if (currentUser) {
      await saveUserProfile(updated);
    }
    setIsAuthModalOpen(false);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    localStorage.setItem(DEMO_LOCAL_KEY, JSON.stringify(updated));
    if (currentUser) {
      await saveUserProfile(updated);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await signOut(auth);
    }
    const defaultProf = getDefaultFarmerProfile('demo-guest');
    setUserProfile(defaultProf);
    localStorage.setItem(DEMO_LOCAL_KEY, JSON.stringify(defaultProf));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogleAuth,
        signInDemoUser,
        updateUserProfile,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
