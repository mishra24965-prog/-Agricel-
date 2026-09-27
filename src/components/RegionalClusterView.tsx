import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  PackageCheck,
  TrendingDown,
  Wheat,
  Phone,
  ShieldCheck,
  Lock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { Language } from '../translations';
import { translations } from '../translations';
import type { Listing, Demand, RegionalCluster } from '../types';

interface RegionalClusterViewProps {
  language: Language;
  clusters: RegionalCluster[];
  demands: Demand[];
  onSelectListing: (listing: Listing) => void;
  onNavigate: (tab: string) => void;
}

export const RegionalClusterView: React.FC<RegionalClusterViewProps> = ({
  language,
  clusters,
  demands,
  onSelectListing,
  onNavigate,
}) => {
  const t = translations[language];
  const [selectedCrop, setSelectedCrop] = useState('All');

  const filteredClusters =
    selectedCrop === 'All'
      ? clusters
      : clusters.filter((c) => c.crop.toLowerCase().includes(selectedCrop.toLowerCase()));

  const cropsAvailable = ['All', ...Array.from(new Set(clusters.map((c) => c.crop)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Regional Supply Aggregation</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Regional Harvest Clusters & Aggregation
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            AI scans all active farm-gate harvest lots across regional districts, bundling supply to match your wholesale demand in unified transport corridors.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start md:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <div className="flex flex-wrap gap-1">
            {cropsAvailable.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCrop === crop
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Cards */}
      {filteredClusters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No active regional clusters found for this crop.
          </h3>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClusters.map((cluster) => (
            <div
              key={`${cluster.district}-${cluster.crop}`}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6 hover:border-purple-500/50 transition-all"
            >
              {/* Cluster Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {cluster.district} Regional Corridor
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 uppercase">
                        {cluster.crop} Cluster
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cluster.listingCount} Farm-Gate Lots aggregated within ~30km radius
                    </p>
                  </div>
                </div>

                {/* Key Cluster Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Total Volume
                    </span>
                    <span className="text-base font-black text-purple-600 dark:text-purple-400">
                      {cluster.totalQty} Tons
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Avg Asking Rate
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{cluster.avgPrice.toLocaleString()} / T
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Avg Grain Purity
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {cluster.avgQualityScore}/100
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Transit Savings
                    </span>
                    <span className="text-base font-black text-amber-500">
                      ~₹{cluster.potentialSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Aggregation Advice Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-emerald-950/30 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {cluster.aiProcurementAdvice}
                </div>
              </div>

              {/* Individual Listings in this Cluster */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Aggregated Farm Lots in {cluster.district}:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cluster.listings.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {l.photoUrl ? (
                          <img
                            src={l.photoUrl}
                            alt={l.crop}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold shrink-0">
                            <Wheat className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full inline-block mb-1">
                            {l.qualityAssessment?.grade.split(' ')[0] || 'Grade A'} • {l.variety}
                          </span>
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {l.farmerName}
                          </h5>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> {l.phone}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Volume:</span>
                          <span className="font-black text-purple-600 dark:text-purple-400">
                            {l.qty} Tons
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Rate:</span>
                          <span className="font-black text-slate-900 dark:text-white">
                            ₹{l.price.toLocaleString()} / Ton
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectListing(l)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Escrow for {l.qty}T</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
