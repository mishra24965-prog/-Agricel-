export type UserRole = 'farmer' | 'buyer' | 'logistics' | 'admin';

export interface QualityAssessment {
  grade: 'Grade A (Export / Premium)' | 'Grade B (Fair Average Quality - FAQ)' | 'Grade C (Milling / Feed Quality)';
  score: number; // 0-100 Optical Purity score
  moisturePercent?: number; // Optional on-site scale meter measurement
  foreignMatterPercent: number; // e.g. 0.4%
  brokenGrainsPercent: number; // e.g. 1.2%
  shriveledPercent: number; // e.g. 0.8%
  luster: 'Bright & Natural' | 'Moderate' | 'Dull / Weathered';
  infestation: 'None Detected' | 'Trace' | 'Present';
  agmarkStandard: string;
  notes: string;
  verifiedAt: string;
  // Enhanced Gemini AI & Official AGMARK/BIS Grounding fields:
  dockageDeduction?: string;
  agronomicAdvice?: string;
  trustedSources?: string[];
  confidenceScore?: number;
  detectedDefects?: string[];
  moistureNotice?: string;
}

export interface PaymentDetails {
  method: 'bank' | 'upi';
  // Bank Account Details (NEFT/RTGS/IMPS direct bank transfer)
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: 'Savings' | 'Current' | 'KCC (Kisan Credit Card)';
  // UPI ID (e.g. 9826011223@sbi or malwafpo@okhdfcbank)
  upiId: string;
  isVerified?: boolean;
  verifiedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  phone: string;
  organization: string;
  district: string;
  photoUrl?: string;
  isRegistered?: boolean;
  facilityAddress?: string;
  bio?: string;
  panOrGstin?: string;

  // Common & KYC
  state?: string;
  kycStatus?: 'Verified' | 'Pending' | 'In Review';

  // Farmer specific details
  farmLandAcres?: string;
  primaryCrops?: string;

  // Buyer specific details
  annualProcurementQuota?: string;
  tradeTerms?: string;

  // ONLY for Farmers (to receive automated harvest payouts) and Buyers (for escrow funding & refunds)
  paymentDetails?: PaymentDetails;
  bankAccountLast4?: string;

  // Dedicated operational details for Weighbridge Operator (NO bank details needed)
  weighbridgeStationId?: string;
  logisticsLicense?: string;
  mandiYard?: string;
  logisticsCapacity?: string;
  calibrationCertificate?: string;
  calibrationExpiry?: string;
  operatingHours?: string;

  // Dedicated regulatory details for Management Arbitrator (NO bank details needed)
  arbitratorAuthorityId?: string;
  arbitratorDesignation?: string;
  jurisdiction?: string;
  jurisdictionMandis?: string;
  barCouncilTenure?: string;
  digitalSignatureCert?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  farmerName: string;
  phone: string;
  crop: string;
  variety: string;
  qty: number;
  price: number;
  location: string;
  district: string; // e.g. 'Indore', 'Ujjain', 'Dewas', 'Hoshangabad'
  photoUrl?: string; // Harvest grain photograph uploaded during listing
  qualityAssessment?: QualityAssessment; // AI inspected grain quality
  harvestDate?: string;
  paymentModePreferred?: 'bank' | 'upi';
  isEscrowGuaranteed?: boolean;
  status: 'Available' | 'Locked in Escrow' | 'Escrow Locked' | 'Sold';
  createdAt: string;
}

export interface Demand {
  id: string;
  buyerName: string;
  buyerId?: string;
  phone?: string;
  buyerPhone?: string;
  crop: string;
  variety: string;
  qtyNeeded?: number;
  qty?: number;
  targetPrice?: number;
  price?: number;
  destination?: string;
  location?: string;
  targetDistrict?: string;
  state?: string;
  escrowReady?: boolean;
  verifiedGST?: boolean;
  status?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  listingId?: string;
  buyerId: string;
  farmerId?: string;
  buyerName: string;
  farmerName: string;
  buyerPhone: string;
  farmerPhone: string;
  crop?: string;
  variety?: string;
  cropInfo?: string;
  origin?: string;
  qty: number;
  pricePerTon: number;
  totalEscrow: number;
  estimatedFreight?: number;
  landedCostPerTon?: number;
  trackingId: string;
  status: 'Escrow Locked' | 'Awaiting Weighbridge' | 'In Transit / Verified' | 'Settled' | 'Disputed';
  weighbridgeStation?: string;
  verifiedWeight?: number;
  scaleSlipUrl?: string;
  paymentRef?: string;
  settledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Grievance {
  id: string;
  orderId: string;
  trackingId: string;
  raisedBy?: string;
  raisedById?: string;
  raisedByName?: string;
  raisedByRole?: UserRole;
  role?: string;
  farmerName?: string;
  farmerPhone?: string;
  buyerName?: string;
  buyerPhone?: string;
  userPhone?: string;
  category: string;
  details: string;
  status: 'Open' | 'Under Investigation' | 'Resolved / Settled';
  ruling?: string;
  verdict?: string;
  arbitratorNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface RegionalCluster {
  district: string;
  crop?: string;
  primaryCrop: string;
  totalAvailableTons: number;
  totalQty?: number;
  activeListingsCount: number;
  listingCount?: number;
  avgAskingPrice: number;
  avgPrice?: number;
  avgQualityScore?: number;
  potentialSavings?: number;
  freightEstimatePerTon?: number;
  aiProcurementAdvice?: string;
  buyerDemandTons: number;
  topVarieties: string[];
  listings?: Listing[];
}
