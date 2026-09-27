import React, { useEffect, useRef, useState, useId } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Wheat,
  Scale,
  DollarSign,
} from 'lucide-react';
import type { Language } from '../translations';

export interface MonthDataPoint {
  month: string;
  monthShort: string;
  year: number;
  yieldTons: number; // Metric Tons harvested / marketed
  yieldPerAcre: number; // Quintals per acre
  pricePerQtl: number; // ₹ per Quintal
  projectedPricePerQtl?: number; // AI projected ₹ per Qtl
  confidenceLower?: number; // AI confidence interval lower bound
  confidenceUpper?: number; // AI confidence interval upper bound
  agmarkGrade: string;
  purityScore: number;
  isForecast?: boolean;
  notes: string;
}

export interface CropPerformanceSeries {
  cropId: string;
  cropName: string;
  cropNameHi: string;
  variety: string;
  unit: string;
  mspBenchmark: number; // MSP ₹ / Qtl
  colorYield: string;
  colorPrice: string;
  data: MonthDataPoint[];
  aiAnalysis: {
    priceOutlook: string;
    priceOutlookHi: string;
    outlookType: 'bullish' | 'neutral' | 'cautious';
    sixMonthRevenue: string;
    avgYieldPerAcre: string;
    optimalSellWindow: string;
    optimalSellWindowHi: string;
    projectedChangePct: number;
  };
}

const CROP_SERIES: CropPerformanceSeries[] = [
  {
    cropId: 'wheat-lokwan',
    cropName: 'Wheat (Lokwan Sharbati)',
    cropNameHi: 'गेहूं (लोकवान शरबती)',
    variety: 'AGMARK Grade-1 FAQ',
    unit: '₹/Qtl',
    mspBenchmark: 2275,
    colorYield: '#10b981', // emerald-500
    colorPrice: '#6366f1', // indigo-500
    data: [
      {
        month: 'April 2026',
        monthShort: 'Apr',
        year: 2026,
        yieldTons: 28.5,
        yieldPerAcre: 19.2,
        pricePerQtl: 2420,
        agmarkGrade: 'Grade-A',
        purityScore: 96,
        notes: 'Peak rabi harvest arrivals across Malwa APMC mandis',
      },
      {
        month: 'May 2026',
        monthShort: 'May',
        year: 2026,
        yieldTons: 34.0,
        yieldPerAcre: 20.8,
        pricePerQtl: 2480,
        agmarkGrade: 'Grade-A',
        purityScore: 97,
        notes: 'Mill direct contracts locked in escrow with zero dockage',
      },
      {
        month: 'June 2026',
        monthShort: 'Jun',
        year: 2026,
        yieldTons: 18.2,
        yieldPerAcre: 18.5,
        pricePerQtl: 2540,
        agmarkGrade: 'Grade-A',
        purityScore: 95,
        notes: 'Warehouse storage offloading; flour mill demand active',
      },
      {
        month: 'July 2026',
        monthShort: 'Jul',
        year: 2026,
        yieldTons: 12.0,
        yieldPerAcre: 17.8,
        pricePerQtl: 2590,
        agmarkGrade: 'Grade-B (FAQ)',
        purityScore: 92,
        notes: 'Rainy season moisture management; dry lots fetched premium',
      },
      {
        month: 'August 2026',
        monthShort: 'Aug',
        year: 2026,
        yieldTons: 8.5,
        yieldPerAcre: 17.5,
        pricePerQtl: 2620,
        agmarkGrade: 'Grade-A',
        purityScore: 96,
        notes: 'Central reserve buffer stocking; Indore bids firm',
      },
      {
        month: 'September 2026',
        monthShort: 'Sep',
        year: 2026,
        yieldTons: 10.5,
        yieldPerAcre: 18.0,
        pricePerQtl: 2650,
        projectedPricePerQtl: 2650,
        confidenceLower: 2610,
        confidenceUpper: 2690,
        agmarkGrade: 'Grade-A',
        purityScore: 98,
        notes: 'Current month spot rate with certified weighbridge clearance',
      },
      {
        month: 'October 2026 (AI Forecast)',
        monthShort: 'Oct*',
        year: 2026,
        yieldTons: 15.0,
        yieldPerAcre: 18.5,
        pricePerQtl: 2715,
        projectedPricePerQtl: 2715,
        confidenceLower: 2660,
        confidenceUpper: 2770,
        isForecast: true,
        agmarkGrade: 'Projected Grade-A',
        purityScore: 96,
        notes: 'AI Model forecasts +2.5% increase due to pre-Diwali flour mill restocking',
      },
    ],
    aiAnalysis: {
      priceOutlook: '+12.2% 6-Month Appreciation. Bullish into festive baking demand.',
      priceOutlookHi: '+12.2% 6-माह मूल्य वृद्धि। त्योहारी सीजन में मिल मांग तेज रहने का अनुमान।',
      outlookType: 'bullish',
      sixMonthRevenue: '₹28,64,500',
      avgYieldPerAcre: '18.6 Qtl/Acre',
      optimalSellWindow: 'Late Sept to mid-Oct before kharif cash crunch',
      optimalSellWindowHi: 'सितंबर अंत से मध्य अक्टूबर (अधिकतम मूल्य अवसर)',
      projectedChangePct: 2.5,
    },
  },
  {
    cropId: 'soybean-yellow',
    cropName: 'Soybean (JS 335 / Yellow)',
    cropNameHi: 'सोयाबीन (पीला / JS 335)',
    variety: 'BIS Yellow Grade-1 (IS: 3569)',
    unit: '₹/Qtl',
    mspBenchmark: 4892,
    colorYield: '#f59e0b', // amber-500
    colorPrice: '#06b6d4', // cyan-500
    data: [
      {
        month: 'April 2026',
        monthShort: 'Apr',
        year: 2026,
        yieldTons: 14.0,
        yieldPerAcre: 9.2,
        pricePerQtl: 4280,
        agmarkGrade: 'Grade-B (FAQ)',
        purityScore: 91,
        notes: 'Carryover stocks liquidation across Dewas & Ujjain',
      },
      {
        month: 'May 2026',
        monthShort: 'May',
        year: 2026,
        yieldTons: 11.5,
        yieldPerAcre: 9.0,
        pricePerQtl: 4320,
        agmarkGrade: 'Grade-A',
        purityScore: 95,
        notes: 'Seed certification demand from regional farmers',
      },
      {
        month: 'June 2026',
        monthShort: 'Jun',
        year: 2026,
        yieldTons: 8.0,
        yieldPerAcre: 8.8,
        pricePerQtl: 4360,
        agmarkGrade: 'Grade-A',
        purityScore: 94,
        notes: 'Sowing season onset; spot crushing rates steady',
      },
      {
        month: 'July 2026',
        monthShort: 'Jul',
        year: 2026,
        yieldTons: 6.2,
        yieldPerAcre: 8.5,
        pricePerQtl: 4390,
        agmarkGrade: 'Grade-A',
        purityScore: 96,
        notes: 'Solvent extraction plant off-take brisk',
      },
      {
        month: 'August 2026',
        monthShort: 'Aug',
        year: 2026,
        yieldTons: 7.8,
        yieldPerAcre: 8.6,
        pricePerQtl: 4420,
        agmarkGrade: 'Grade-A',
        purityScore: 95,
        notes: 'Soymeal export parity driving institutional bids',
      },
      {
        month: 'September 2026',
        monthShort: 'Sep',
        year: 2026,
        yieldTons: 16.5,
        yieldPerAcre: 10.4,
        pricePerQtl: 4460,
        projectedPricePerQtl: 4460,
        confidenceLower: 4410,
        confidenceUpper: 4510,
        agmarkGrade: 'Grade-A',
        purityScore: 97,
        notes: 'Early kharif pod maturity; test threshed samples',
      },
      {
        month: 'October 2026 (AI Forecast)',
        monthShort: 'Oct*',
        year: 2026,
        yieldTons: 32.0,
        yieldPerAcre: 11.2,
        pricePerQtl: 4580,
        projectedPricePerQtl: 4580,
        confidenceLower: 4490,
        confidenceUpper: 4670,
        isForecast: true,
        agmarkGrade: 'Projected Grade-A',
        purityScore: 96,
        notes: 'Main kharif harvest peak. High moisture dockage risk; recommend sun drying',
      },
    ],
    aiAnalysis: {
      priceOutlook: '+7.0% 6-Month Steady Ascent. High crush margins supporting APMC bids.',
      priceOutlookHi: '+7.0% 6-माह मजबूत उछाल। सॉल्वेंट एक्सट्रैक्शन प्लांट की लगातार मांग।',
      outlookType: 'bullish',
      sixMonthRevenue: '₹37,84,200',
      avgYieldPerAcre: '9.4 Qtl/Acre',
      optimalSellWindow: 'Stagger dispatch: 40% immediate, 60% post-dew moisture cure',
      optimalSellWindowHi: 'चरणबद्ध बिक्री: 40% तुरंत, 60% सुखाने के बाद',
      projectedChangePct: 2.7,
    },
  },
  {
    cropId: 'chana-gram',
    cropName: 'Gram / Chickpea (Desi Chana)',
    cropNameHi: 'चना (देसी चना)',
    variety: 'AGMARK Grade-1 Sortex',
    unit: '₹/Qtl',
    mspBenchmark: 5440,
    colorYield: '#8b5cf6', // purple-500
    colorPrice: '#ec4899', // pink-500
    data: [
      {
        month: 'April 2026',
        monthShort: 'Apr',
        year: 2026,
        yieldTons: 16.0,
        yieldPerAcre: 8.5,
        pricePerQtl: 5650,
        agmarkGrade: 'Grade-A',
        purityScore: 98,
        notes: 'Harvest arrival peak; dal millers competitive bidding',
      },
      {
        month: 'May 2026',
        monthShort: 'May',
        year: 2026,
        yieldTons: 19.5,
        yieldPerAcre: 9.1,
        pricePerQtl: 5720,
        agmarkGrade: 'Grade-A',
        purityScore: 97,
        notes: 'Nafed procurement buffer window open',
      },
      {
        month: 'June 2026',
        monthShort: 'Jun',
        year: 2026,
        yieldTons: 12.0,
        yieldPerAcre: 8.4,
        pricePerQtl: 5800,
        agmarkGrade: 'Grade-A',
        purityScore: 96,
        notes: 'Besan and pulse mill direct institutional orders',
      },
      {
        month: 'July 2026',
        monthShort: 'Jul',
        year: 2026,
        yieldTons: 7.5,
        yieldPerAcre: 8.0,
        pricePerQtl: 5890,
        agmarkGrade: 'Grade-A',
        purityScore: 95,
        notes: 'Tight physical float in APMC warehouses',
      },
      {
        month: 'August 2026',
        monthShort: 'Aug',
        year: 2026,
        yieldTons: 5.0,
        yieldPerAcre: 7.9,
        pricePerQtl: 5980,
        agmarkGrade: 'Grade-A',
        purityScore: 96,
        notes: 'Festival sweets demand driving spot pulse premiums',
      },
      {
        month: 'September 2026',
        monthShort: 'Sep',
        year: 2026,
        yieldTons: 6.8,
        yieldPerAcre: 8.2,
        pricePerQtl: 6080,
        projectedPricePerQtl: 6080,
        confidenceLower: 6010,
        confidenceUpper: 6150,
        agmarkGrade: 'Grade-A',
        purityScore: 98,
        notes: 'Historical premium over MSP benchmark (+₹640/Qtl)',
      },
      {
        month: 'October 2026 (AI Forecast)',
        monthShort: 'Oct*',
        year: 2026,
        yieldTons: 8.0,
        yieldPerAcre: 8.5,
        pricePerQtl: 6220,
        projectedPricePerQtl: 6220,
        confidenceLower: 6120,
        confidenceUpper: 6320,
        isForecast: true,
        agmarkGrade: 'Projected Grade-A',
        purityScore: 97,
        notes: 'AI Model projects +2.3% upside as Diwali sweet manufacturers stock besan',
      },
    ],
    aiAnalysis: {
      priceOutlook: '+10.1% Strong Outperformance. Premium pulse trades well above MSP.',
      priceOutlookHi: '+10.1% एमएसपी से ऊपर मजबूत भाव। दाल मिलों की आक्रामक खरीद।',
      outlookType: 'bullish',
      sixMonthRevenue: '₹39,87,000',
      avgYieldPerAcre: '8.4 Qtl/Acre',
      optimalSellWindow: 'Hold Grade-A Sortex lots for Diwali delivery window',
      optimalSellWindowHi: 'दीवाली मांग तक ग्रेड-ए लॉट सुरक्षित रखें',
      projectedChangePct: 2.3,
    },
  },
];

interface FarmerYieldAndPriceWidgetProps {
  language: Language;
  onNavigateToListing?: () => void;
}

export const FarmerYieldAndPriceWidget: React.FC<FarmerYieldAndPriceWidgetProps> = ({
  language,
  onNavigateToListing,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>('wheat-lokwan');
  const [viewMode, setViewMode] = useState<'both' | 'yield' | 'price'>('both');
  const [hoveredPoint, setHoveredPoint] = useState<MonthDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const uniqueId = useId();

  const isHindi = language === 'hi';
  const currentCrop = CROP_SERIES.find((c) => c.cropId === selectedCropId) || CROP_SERIES[0];

  // D3 Chart Render Function
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 700;
    const height = 340;
    const margin = {
      top: 28,
      right: viewMode === 'yield' ? 24 : 64,
      bottom: 42,
      left: viewMode === 'price' ? 32 : 54,
    };
    const width = Math.max(containerWidth, 480);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = currentCrop.data;

    // --- X Scale (Months) ---
    const x0 = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.monthShort))
      .range([0, innerWidth])
      .padding(0.38);

    // --- Y Scale for Yield (Tons) ---
    const maxYield = (d3.max(data, (d) => d.yieldTons) || 40) * 1.25;
    const yYield = d3.scaleLinear().domain([0, maxYield]).range([innerHeight, 0]);

    // --- Y Scale for Price (₹ / Qtl) ---
    const minPrice =
      (d3.min(data, (d) => Math.min(d.pricePerQtl, d.confidenceLower || d.pricePerQtl)) || 2000) *
      0.94;
    const maxPrice =
      (d3.max(data, (d) => Math.max(d.pricePerQtl, d.confidenceUpper || d.pricePerQtl)) || 3000) *
      1.05;
    const yPrice = d3.scaleLinear().domain([minPrice, maxPrice]).range([innerHeight, 0]);

    // --- Defs for Gradients ---
    const defs = svg.append('defs');

    // Yield Bar Gradient
    const yieldGrad = defs
      .append('linearGradient')
      .attr('id', `yield-grad-${uniqueId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    yieldGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', currentCrop.colorYield)
      .attr('stop-opacity', 0.95);
    yieldGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', currentCrop.colorYield)
      .attr('stop-opacity', 0.25);

    // Forecast Bar Gradient
    const forecastBarGrad = defs
      .append('linearGradient')
      .attr('id', `forecast-grad-${uniqueId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    forecastBarGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#a855f7')
      .attr('stop-opacity', 0.85);
    forecastBarGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#a855f7')
      .attr('stop-opacity', 0.15);

    // Price Area Gradient
    const priceAreaGrad = defs
      .append('linearGradient')
      .attr('id', `price-area-${uniqueId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    priceAreaGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', currentCrop.colorPrice)
      .attr('stop-opacity', 0.35);
    priceAreaGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', currentCrop.colorPrice)
      .attr('stop-opacity', 0.0);

    // Confidence Band Gradient
    const confGrad = defs
      .append('linearGradient')
      .attr('id', `conf-band-${uniqueId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    confGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#818cf8')
      .attr('stop-opacity', 0.15);
    confGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#c084fc')
      .attr('stop-opacity', 0.3);

    // --- Grid Lines (Horizontal) ---
    const yAxisGrid = d3
      .axisLeft(yYield)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    // --- Render Yield Bars (if viewMode is 'both' or 'yield') ---
    if (viewMode === 'both' || viewMode === 'yield') {
      const barsGroup = g.append('g').attr('class', 'bars-group');

      barsGroup
        .selectAll('.yield-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'yield-bar')
        .attr('x', (d) => x0(d.monthShort) || 0)
        .attr('y', innerHeight)
        .attr('width', x0.bandwidth())
        .attr('height', 0)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', (d) =>
          d.isForecast ? `url(#forecast-grad-${uniqueId})` : `url(#yield-grad-${uniqueId})`
        )
        .attr('stroke', (d) => (d.isForecast ? '#c084fc' : currentCrop.colorYield))
        .attr('stroke-width', (d) => (d.isForecast ? 1.5 : 0))
        .attr('stroke-dasharray', (d) => (d.isForecast ? '3,2' : 'none'))
        .style('cursor', 'pointer')
        .transition()
        .duration(800)
        .delay((_, i) => i * 60)
        .attr('y', (d) => yYield(d.yieldTons))
        .attr('height', (d) => Math.max(0, innerHeight - yYield(d.yieldTons)));

      // Bar Value Labels
      barsGroup
        .selectAll('.yield-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'yield-label')
        .attr('x', (d) => (x0(d.monthShort) || 0) + x0.bandwidth() / 2)
        .attr('y', (d) => yYield(d.yieldTons) - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', (d) => (d.isForecast ? '#a855f7' : currentCrop.colorYield))
        .text((d) => `${d.yieldTons}T`)
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay(600)
        .style('opacity', 0.9);
    }

    // --- Render Price Line & Area (if viewMode is 'both' or 'price') ---
    if (viewMode === 'both' || viewMode === 'price') {
      const priceGroup = g.append('g').attr('class', 'price-group');

      const historicalPoints = data.filter((d) => !d.isForecast);
      const forecastPoints = data.filter((d, i) => i >= data.length - 2);

      const getXCenter = (d: MonthDataPoint) => (x0(d.monthShort) || 0) + x0.bandwidth() / 2;

      // Price Area Generator
      const areaGen = d3
        .area<MonthDataPoint>()
        .x((d) => getXCenter(d))
        .y0(innerHeight)
        .y1((d) => yPrice(d.pricePerQtl))
        .curve(d3.curveMonotoneX);

      // Price Line Generator
      const lineGen = d3
        .line<MonthDataPoint>()
        .x((d) => getXCenter(d))
        .y((d) => yPrice(d.pricePerQtl))
        .curve(d3.curveMonotoneX);

      // Render Area under curve
      priceGroup
        .append('path')
        .datum(data)
        .attr('fill', `url(#price-area-${uniqueId})`)
        .attr('d', areaGen);

      // Render Historical Solid Line
      const histPath = priceGroup
        .append('path')
        .datum(historicalPoints)
        .attr('fill', 'none')
        .attr('stroke', currentCrop.colorPrice)
        .attr('stroke-width', 3)
        .attr('d', lineGen);

      // Animate line stroke
      const totalLen = (histPath.node() as SVGPathElement)?.getTotalLength() || 600;
      histPath
        .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);

      // Render Forecast Dashed Line (with glow)
      if (forecastPoints.length >= 2) {
        // AI Confidence Band Area
        const confBandGen = d3
          .area<MonthDataPoint>()
          .x((d) => getXCenter(d))
          .y0((d) => yPrice(d.confidenceLower || d.pricePerQtl * 0.98))
          .y1((d) => yPrice(d.confidenceUpper || d.pricePerQtl * 1.02))
          .curve(d3.curveMonotoneX);

        priceGroup
          .append('path')
          .datum(forecastPoints)
          .attr('fill', `url(#conf-band-${uniqueId})`)
          .attr('d', confBandGen);

        priceGroup
          .append('path')
          .datum(forecastPoints)
          .attr('fill', 'none')
          .attr('stroke', '#a855f7')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '5,4')
          .attr('d', lineGen);
      }

      // MSP Government Benchmark Reference Line
      if (currentCrop.mspBenchmark) {
        const mspY = yPrice(currentCrop.mspBenchmark);
        if (mspY >= 0 && mspY <= innerHeight) {
          const mspGroup = priceGroup.append('g').attr('class', 'msp-ref');
          mspGroup
            .append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', mspY)
            .attr('y2', mspY)
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,4')
            .attr('opacity', 0.65);

          mspGroup
            .append('text')
            .attr('x', 6)
            .attr('y', mspY - 4)
            .attr('fill', '#ef4444')
            .attr('font-size', '9px')
            .attr('font-weight', '700')
            .text(`Govt MSP Benchmark: ₹${currentCrop.mspBenchmark}`);
        }
      }

      // Price Dots
      priceGroup
        .selectAll('.price-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'price-dot')
        .attr('cx', (d) => getXCenter(d))
        .attr('cy', (d) => yPrice(d.pricePerQtl))
        .attr('r', (d) => (d.isForecast ? 5.5 : 4.5))
        .attr('fill', (d) => (d.isForecast ? '#c084fc' : currentCrop.colorPrice))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))');
    }

    // --- Bottom X Axis ---
    const xAxis = d3.axisBottom(x0);
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', 'currentColor').attr('stroke-opacity', 0.2);
    xAxisGroup
      .selectAll('text')
      .attr('fill', 'currentColor')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('dy', '12px');

    // --- Left Y Axis (Yield Tons) ---
    if (viewMode === 'both' || viewMode === 'yield') {
      const yAxisYield = d3.axisLeft(yYield).ticks(5).tickFormat((d) => `${d}T`);
      const yAxisYieldGroup = g.append('g').call(yAxisYield);
      yAxisYieldGroup.select('.domain').remove();
      yAxisYieldGroup
        .selectAll('text')
        .attr('fill', currentCrop.colorYield)
        .attr('font-size', '10px')
        .attr('font-weight', '700');

      // Axis Label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -38)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', currentCrop.colorYield)
        .attr('font-size', '10px')
        .attr('font-weight', '800')
        .text('HARVEST YIELD (METRIC TONS)');
    }

    // --- Right Y Axis (Price ₹/Qtl) ---
    if (viewMode === 'both' || viewMode === 'price') {
      const yAxisPrice = d3.axisRight(yPrice).ticks(5).tickFormat((d) => `₹${d}`);
      const yAxisPriceGroup = g
        .append('g')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(yAxisPrice);
      yAxisPriceGroup.select('.domain').remove();
      yAxisPriceGroup
        .selectAll('text')
        .attr('fill', currentCrop.colorPrice)
        .attr('font-size', '10px')
        .attr('font-weight', '700');

      // Axis Label
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -innerWidth - 48)
        .attr('x', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', currentCrop.colorPrice)
        .attr('font-size', '10px')
        .attr('font-weight', '800')
        .text('MARKET RATE (₹ / QUINTAL)');
    }

    // --- Interactive Hover Overlay & Crosshair ---
    const overlay = g
      .append('rect')
      .attr('class', 'hover-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const crosshair = g
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const eachBand = x0.step();
        const index = Math.floor(mx / eachBand);
        const clampedIdx = Math.max(0, Math.min(data.length - 1, index));
        const d = data[clampedIdx];

        if (d) {
          const cx = (x0(d.monthShort) || 0) + x0.bandwidth() / 2;
          crosshair.attr('x1', cx).attr('x2', cx).style('opacity', 0.85);

          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
          setHoveredPoint(d);
        }
      })
      .on('mouseleave', () => {
        crosshair.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      });
  }, [selectedCropId, viewMode, currentCrop, uniqueId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md space-y-5">
      {/* Widget Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isHindi
                ? 'फसल उपज और एआई-अनुमानित बाजार भाव रुझान (६ माह)'
                : 'Harvest Yield Trends & AI Market Price Projections (Last 6 Months)'}
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>D3.js & Gemini 3.8 Intelligence</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isHindi
              ? 'वास्तविक मासिक आवक तौल और एगमार्क ग्रेड-१ के आधार पर एआई-प्रक्षेपित मूल्य प्रक्षेपवक्र'
              : 'Interactive D3 visualizer cross-referencing certified harvest tonnage against spot APMC rates & AI predictive bands'}
          </p>
        </div>

        {/* Action Controls: Crop Switcher & View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Crop Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {CROP_SERIES.map((c) => (
              <button
                key={c.cropId}
                onClick={() => setSelectedCropId(c.cropId)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCropId === c.cropId
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isHindi ? c.cropNameHi.split(' ')[0] : c.cropName.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'both'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isHindi ? 'संयुक्त' : 'Combined'}
            </button>
            <button
              onClick={() => setViewMode('yield')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'yield'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isHindi ? 'उपज' : 'Yield'}
            </button>
            <button
              onClick={() => setViewMode('price')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'price'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isHindi ? 'भाव' : 'Price'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {isHindi ? '६ माह कुल राजस्व' : '6-Mo Realized Rev'}
            </span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
            {currentCrop.aiAnalysis.sixMonthRevenue}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {isHindi ? 'एस्क्रो प्रमाणित भुगतान' : '100% Escrow Disbursed'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {isHindi ? 'औसत प्रति एकड़ पैदावार' : 'Avg Productivity'}
            </span>
            <Wheat className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-indigo-800 dark:text-indigo-200 mt-0.5">
            {currentCrop.aiAnalysis.avgYieldPerAcre}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {isHindi ? 'मालवा संभाग बेंचमार्क' : 'Central MP Benchmark'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              {isHindi ? 'एआई आगामी मूल्य रुख' : 'AI Market Outlook'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </div>
          <div className="text-base sm:text-lg font-black text-purple-800 dark:text-purple-200 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>+{currentCrop.aiAnalysis.projectedChangePct}% Outlook</span>
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            {isHindi ? 'त्योहारी सीजन अग्रिम मांग' : 'Oct Pre-Diwali restocking'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              {isHindi ? 'सरकारी एमएसपी तुलना' : 'MSP Premium Gap'}
            </span>
            <Scale className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-200 mt-0.5">
            +₹
            {currentCrop.data[currentCrop.data.length - 2].pricePerQtl -
              currentCrop.mspBenchmark}
            /Qtl
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
            {isHindi ? 'एगमार्क गुणवत्ता प्रीमियम' : 'Over IS/FAQ Floor Price'}
          </span>
        </div>
      </div>

      {/* Interactive Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-4 flex-wrap">
          {(viewMode === 'both' || viewMode === 'yield') && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-md"
                style={{ backgroundColor: currentCrop.colorYield }}
              ></span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isHindi ? 'मासिक तौल उपज (टन)' : 'Monthly Harvest Volume (Tons)'}
              </span>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'price') && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentCrop.colorPrice }}
              ></span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isHindi ? 'मंडी हाजिर भाव (₹/क्विंटल)' : 'Mandi Spot Rate (₹/Qtl)'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-purple-500 rounded border-dashed"></span>
            <span className="font-semibold text-purple-700 dark:text-purple-300">
              {isHindi ? 'एआई अनुमानित प्रक्षेपवक्र (अक्टूबर)' : 'AI Projected Trajectory (Oct*)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-500 border-dashed"></span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {isHindi
                ? 'सरकारी एमएसपी बेंचमार्क'
                : `MSP Benchmark (₹${currentCrop.mspBenchmark})`}
            </span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 italic font-medium">
          {isHindi
            ? '* डेटा बिंदु पर कर्सर ले जाकर विवरण देखें'
            : '* Hover or touch points for audit slip'}
        </span>
      </div>

      {/* Main D3 SVG Canvas with Responsive Wrapper */}
      <div
        ref={containerRef}
        className="w-full relative bg-slate-50/70 dark:bg-slate-950/60 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 overflow-hidden"
      >
        <svg
          ref={svgRef}
          className="w-full h-auto overflow-visible select-none transition-all duration-300"
          style={{ minHeight: '300px' }}
        />

        {/* Floating Rich Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md text-xs space-y-1.5 transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${Math.max(
                130,
                Math.min(tooltipPos.x, (containerRef.current?.clientWidth || 600) - 130)
              )}px`,
              top: `${Math.max(10, tooltipPos.y - 12)}px`,
              minWidth: '230px',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {hoveredPoint.month}
              </span>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  hoveredPoint.isForecast
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {hoveredPoint.isForecast ? 'AI Forecast' : hoveredPoint.agmarkGrade}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Yield Volume</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {hoveredPoint.yieldTons} Tons
                </span>
                <span className="text-[9px] text-slate-400 block">
                  ({hoveredPoint.yieldPerAcre} Qtl/Acre)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {hoveredPoint.isForecast ? 'AI Projected Rate' : 'Mandi Spot Rate'}
                </span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  ₹{hoveredPoint.pricePerQtl} / Qtl
                </span>
                {hoveredPoint.confidenceLower && (
                  <span className="text-[9px] text-purple-500 font-semibold block">
                    Band: ₹{hoveredPoint.confidenceLower} - ₹{hoveredPoint.confidenceUpper}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <span>Estimated Lot Value:</span>
                <span className="font-black text-emerald-600">
                  ₹{(hoveredPoint.yieldTons * 10 * hoveredPoint.pricePerQtl).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5 leading-snug">
                "{hoveredPoint.notes}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Market Intelligence & Agronomic Guidance Footer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-emerald-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {isHindi
                ? `एआई विक्रय व एस्क्रो रणनीति: ${currentCrop.cropNameHi}`
                : `AI Sales & Escrow Strategy: ${currentCrop.cropName}`}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isHindi ? currentCrop.aiAnalysis.priceOutlookHi : currentCrop.aiAnalysis.priceOutlook}{' '}
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {isHindi
                ? `इष्टतम बिक्री खिड़की: ${currentCrop.aiAnalysis.optimalSellWindowHi}`
                : `Optimal Window: ${currentCrop.aiAnalysis.optimalSellWindow}`}
            </span>
          </p>
        </div>

        {onNavigateToListing && (
          <button
            onClick={onNavigateToListing}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5 transform hover:scale-105"
          >
            <span>{isHindi ? 'इस भाव पर फसल लिस्ट करें' : 'List Harvest at Peak Price'}</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
