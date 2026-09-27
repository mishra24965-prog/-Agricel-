export type UserRole = 'farmer' | 'buyer' | 'logistics' | 'admin';

export interface QualityAssessment {
  grade: 'Grade A (Export / Premium)' | 'Grade B (Fair Average Quality - FAQ)' | 'Grade C (Milling / Feed Quality)';
  score: number; // 0-100
  moisturePercent: number; // e.g. 11.2%
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
  status: 'Available' | 'Escrow Locked' | 'Sold';
  createdAt: string;
}

export interface Order {
  id: string;
  trackingId: string;
  cropInfo: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  qty: number;
  pricePerTon: number;
  totalEscrow: number;
  estimatedFreight?: number;
  landedCostPerTon?: number;
  status: 'Awaiting Weighbridge' | 'In Transit / Verified' | 'Settled' | 'Disputed';
  origin: string;
  verifiedWeight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Demand {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  crop: string;
  variety: string;
  qty: number;
  price: number;
  location: string;
  targetDistrict?: string;
  status: 'Open' | 'Fulfilled';
  createdAt: string;
}

export interface Grievance {
  id: string;
  trackingId: string;
  orderId: string;
  raisedById: string;
  raisedByName: string;
  userPhone: string;
  farmerPhone: string;
  role: string;
  category: string;
  details: string;
  status: 'Open' | 'Resolved';
  verdict?: string;
  createdAt: string;
}

export interface RegionalCluster {
  district: string;
  crop: string;
  totalQty: number;
  listingCount: number;
  avgPrice: number;
  avgQualityScore: number;
  listings: Listing[];
  freightEstimatePerTon: number;
  potentialSavings: number;
  aiProcurementAdvice: string;
}
