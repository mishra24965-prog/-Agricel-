import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { Listing, Order, Demand, Grievance, UserProfile, RegionalCluster } from '../types';

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'L-101',
    ownerId: 'default-farmer-1',
    farmerName: 'Malwa Organic FPO (Rajesh Kumar)',
    phone: '+91 98260 11223',
    crop: 'Wheat',
    variety: 'Lokwan Grade-A',
    qty: 35,
    price: 25800,
    location: 'Sanwer Mandi Road, Indore District, MP',
    district: 'Indore',
    photoUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    qualityAssessment: {
      grade: 'Grade A (Export / Premium)',
      score: 96,
      moisturePercent: 11.2,
      foreignMatterPercent: 0.35,
      brokenGrainsPercent: 1.1,
      shriveledPercent: 0.6,
      luster: 'Bright & Natural',
      infestation: 'None Detected',
      agmarkStandard: 'AGMARK Grade-1 / FAQ (IS: 1488-2004)',
      notes: 'Plump golden grains, uniform sieve test, optimal low moisture suitable for long-term vaulting.',
      verifiedAt: new Date().toISOString(),
    },
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'L-102',
    ownerId: 'default-farmer-2',
    farmerName: 'Vindhya Kisan Producer Co.',
    phone: '+91 94250 88776',
    crop: 'Soybean',
    variety: 'JS 335 Certified',
    qty: 45,
    price: 44200,
    location: 'Barnagar Yard, Ujjain Mandi, MP',
    district: 'Ujjain',
    photoUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
    qualityAssessment: {
      grade: 'Grade A (Export / Premium)',
      score: 94,
      moisturePercent: 9.8,
      foreignMatterPercent: 0.7,
      brokenGrainsPercent: 2.1,
      shriveledPercent: 1.2,
      luster: 'Bright & Natural',
      infestation: 'None Detected',
      agmarkStandard: 'BIS Yellow Soybean Grade-1 (IS: 3569)',
      notes: 'High oil density kernels (>18.5% oil yield estimation), zero pod residue, under 10% moisture.',
      verifiedAt: new Date().toISOString(),
    },
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'L-103',
    ownerId: 'default-farmer-3',
    farmerName: 'Narmada Valley Farmers Co-op',
    phone: '+91 91110 33445',
    crop: 'Paddy (Dhan)',
    variety: 'Basmati 1121 Harvest',
    qty: 40,
    price: 31500,
    location: 'Pipariya Hub, Hoshangabad, MP',
    district: 'Hoshangabad',
    photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    qualityAssessment: {
      grade: 'Grade A (Export / Premium)',
      score: 95,
      moisturePercent: 13.1,
      foreignMatterPercent: 0.45,
      brokenGrainsPercent: 1.8,
      shriveledPercent: 0.9,
      luster: 'Bright & Natural',
      infestation: 'None Detected',
      agmarkStandard: 'FCI Common / Grade-A Specifications',
      notes: 'Extra long slender paddy hulls, minimal chalkiness, high head rice recovery potential.',
      verifiedAt: new Date().toISOString(),
    },
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'L-104',
    ownerId: 'default-farmer-4',
    farmerName: 'Kshipra Progressive Growers',
    phone: '+91 97550 44332',
    crop: 'Wheat',
    variety: 'Sharbati Premium',
    qty: 30,
    price: 27200,
    location: 'Depalpur Corridor, Indore District, MP',
    district: 'Indore',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    qualityAssessment: {
      grade: 'Grade A (Export / Premium)',
      score: 97,
      moisturePercent: 10.9,
      foreignMatterPercent: 0.25,
      brokenGrainsPercent: 0.9,
      shriveledPercent: 0.4,
      luster: 'Bright & Natural',
      infestation: 'None Detected',
      agmarkStandard: 'AGMARK Grade-1 / FAQ (IS: 1488-2004)',
      notes: 'Super-premium Sharbati golden luster, rich test weight > 82 kg/hL, zero dockage.',
      verifiedAt: new Date().toISOString(),
    },
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'L-105',
    ownerId: 'default-farmer-5',
    farmerName: 'Mahakal Krishak Union',
    phone: '+91 96320 88114',
    crop: 'Wheat',
    variety: 'Lokwan Milling Grade',
    qty: 25,
    price: 25600,
    location: 'Tarana Road, Ujjain District, MP',
    district: 'Ujjain',
    photoUrl: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
    qualityAssessment: {
      grade: 'Grade B (Fair Average Quality - FAQ)',
      score: 88,
      moisturePercent: 12.4,
      foreignMatterPercent: 0.65,
      brokenGrainsPercent: 2.3,
      shriveledPercent: 1.8,
      luster: 'Moderate',
      infestation: 'None Detected',
      agmarkStandard: 'AGMARK Grade-1 / FAQ (IS: 1488-2004)',
      notes: 'Fair Average Quality meeting standard flour milling specs. Dry and clean.',
      verifiedAt: new Date().toISOString(),
    },
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'O-501',
    trackingId: 'AGR-492810',
    cropInfo: '20T Wheat (Lokwan Grade-A)',
    buyerId: 'default-buyer-1',
    buyerName: 'AgroProcure Grain Corp',
    buyerPhone: '+91 98930 55443',
    farmerId: 'default-farmer-1',
    farmerName: 'Rajesh Kumar (Malwa FPO)',
    farmerPhone: '+91 98260 11223',
    qty: 20,
    pricePerTon: 25500,
    totalEscrow: 510000,
    estimatedFreight: 14000,
    landedCostPerTon: 26200,
    status: 'In Transit / Verified',
    origin: 'Indore, MP',
    verifiedWeight: 20.0,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'O-502',
    trackingId: 'AGR-832104',
    cropInfo: '25T Soybean (JS 335)',
    buyerId: 'default-buyer-2',
    buyerName: 'Central Oils & Flour Mills',
    buyerPhone: '+91 97130 44221',
    farmerId: 'default-farmer-2',
    farmerName: 'Vindhya Kisan Producer',
    farmerPhone: '+91 94250 88776',
    qty: 25,
    pricePerTon: 44000,
    totalEscrow: 1100000,
    estimatedFreight: 21000,
    landedCostPerTon: 44840,
    status: 'Awaiting Weighbridge',
    origin: 'Ujjain, MP',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_DEMANDS: Demand[] = [
  {
    id: 'D-801',
    buyerId: 'default-buyer-1',
    buyerName: 'AgroProcure Corp (Indore Hub)',
    buyerPhone: '+91 98930 55443',
    crop: 'Wheat',
    variety: 'Lokwan',
    qty: 60,
    price: 25900,
    location: 'Indore Warehouse Complex, MP',
    targetDistrict: 'Indore',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'D-802',
    buyerId: 'default-buyer-2',
    buyerName: 'Central Oils & Solvent Extracts',
    buyerPhone: '+91 97130 44221',
    crop: 'Soybean',
    variety: 'JS 335',
    qty: 50,
    price: 44100,
    location: 'Dewas Industrial Belt, MP',
    targetDistrict: 'Ujjain',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'TKT-1082',
    trackingId: 'AGR-492810',
    orderId: 'O-501',
    raisedById: 'default-buyer-1',
    raisedByName: 'AgroProcure Corp',
    userPhone: '+91 98930 55443',
    farmerPhone: '+91 98260 11223',
    role: 'buyer',
    category: 'Transit Delay',
    details: 'Carrier dispatch delayed weighbridge arrival by 14 hours due to highway maintenance.',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
];

export async function seedInitialDataIfEmpty() {
  try {
    const listSnapshot = await getDocs(collection(db, 'listings'));
    if (listSnapshot.empty) {
      for (const item of INITIAL_LISTINGS) {
        await setDoc(doc(db, 'listings', item.id), item);
      }
    }

    const orderSnapshot = await getDocs(collection(db, 'orders'));
    if (orderSnapshot.empty) {
      for (const item of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', item.id), item);
      }
    }

    const demandSnapshot = await getDocs(collection(db, 'demands'));
    if (demandSnapshot.empty) {
      for (const item of INITIAL_DEMANDS) {
        await setDoc(doc(db, 'demands', item.id), item);
      }
    }

    const grievanceSnapshot = await getDocs(collection(db, 'grievances'));
    if (grievanceSnapshot.empty) {
      for (const item of INITIAL_GRIEVANCES) {
        await setDoc(doc(db, 'grievances', item.id), item);
      }
    }
  } catch (error) {
    console.warn('Initial seeding bypassed or completed:', error);
  }
}

export function subscribeToListings(onUpdate: (listings: Listing[]) => void) {
  const path = 'listings';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Listing);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToDemands(onUpdate: (demands: Demand[]) => void) {
  const path = 'demands';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Demand[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Demand);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToGrievances(onUpdate: (grievances: Grievance[]) => void) {
  const path = 'grievances';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Grievance[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Grievance);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToUserProfile(uid: string, onUpdate: (profile: UserProfile | null) => void) {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveUserProfile(profile: UserProfile) {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createCropListing(listing: Listing) {
  const path = `listings/${listing.id}`;
  try {
    await setDoc(doc(db, 'listings', listing.id), listing);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateCropListingStatus(listingId: string, status: Listing['status']) {
  const path = `listings/${listingId}`;
  try {
    await updateDoc(doc(db, 'listings', listingId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createEscrowOrder(order: Order) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function verifyWeighbridgeAndDisburse(orderId: string, actualWeight: number) {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'In Transit / Verified',
      verifiedWeight: actualWeight,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createBuyerDemand(demand: Demand) {
  const path = `demands/${demand.id}`;
  try {
    await setDoc(doc(db, 'demands', demand.id), demand);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createGrievanceTicket(grievance: Grievance) {
  const path = `grievances/${grievance.id}`;
  try {
    await setDoc(doc(db, 'grievances', grievance.id), grievance);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function resolveArbitrationTicket(id: string, verdict: string) {
  const path = `grievances/${id}`;
  try {
    await updateDoc(doc(db, 'grievances', id), {
      status: 'Resolved',
      verdict,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * AI Regional Crop Aggregator:
 * Scans all listed crop lots, groups them by geographic cluster/district,
 * maps them against wholesale buyer demands, and calculates consolidated volume & freight savings!
 */
export function computeRegionalClusters(
  listings: Listing[],
  demands: Demand[]
): RegionalCluster[] {
  const availableListings = listings.filter((l) => l.status === 'Available');

  // Group by (district + crop)
  const map = new Map<string, Listing[]>();
  for (const l of availableListings) {
    const key = `${l.district || 'Indore'}|||${l.crop}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(l);
  }

  const clusters: RegionalCluster[] = [];

  map.forEach((clusterListings, key) => {
    const [district, crop] = key.split('|||');
    const totalQty = clusterListings.reduce((sum, l) => sum + l.qty, 0);
    const avgPrice = Math.round(
      clusterListings.reduce((sum, l) => sum + l.price * l.qty, 0) / (totalQty || 1)
    );
    const avgQualityScore = Math.round(
      clusterListings.reduce((sum, l) => sum + (l.qualityAssessment?.score || 90), 0) /
        clusterListings.length
    );

    // Matching demand for this crop
    const matchingDemand = demands.find(
      (d) => d.crop.toLowerCase() === crop.toLowerCase() && d.status === 'Open'
    );

    // Consolidated freight savings: bundling farm-gate lots within the same district saves ~₹280 to ₹420 / Ton
    const freightEstimatePerTon = district.toLowerCase().includes('indore')
      ? 450
      : district.toLowerCase().includes('ujjain')
      ? 580
      : 720;
    const potentialSavings = Math.round(totalQty * 320); // Saved compared to piecemeal fragmented trucking

    let advice = `Concentrated regional supply in ${district}: ${totalQty} Tons of ${crop} available across ${clusterListings.length} farm lot(s).`;
    if (matchingDemand) {
      if (totalQty >= matchingDemand.qty) {
        advice = `🎯 Exact Demand Match: ${district} has ${totalQty} Tons of ${crop}—completely satisfying your ${matchingDemand.qty} Ton procurement in one single logistics route! Average asking price is ₹${avgPrice}/Ton.`;
      } else {
        advice = `Partial Match: ${district} provides ${totalQty} Tons of your ${matchingDemand.qty} Ton demand with average purity of ${avgQualityScore}/100. Consolidating these saves ~₹${potentialSavings.toLocaleString()} in multi-stop freight.`;
      }
    }

    clusters.push({
      district,
      crop,
      totalQty,
      listingCount: clusterListings.length,
      avgPrice,
      avgQualityScore,
      listings: clusterListings,
      freightEstimatePerTon,
      potentialSavings,
      aiProcurementAdvice: advice,
    });
  });

  return clusters.sort((a, b) => b.totalQty - a.totalQty);
}
