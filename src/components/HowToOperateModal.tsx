import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Wheat,
  Tractor,
  Store,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  Mic,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Building2,
  DollarSign,
  Truck,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../translations';
import type { UserRole } from '../types';

interface HowToOperateModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigateTab: (tab: string, portal: UserRole) => void;
  onOpenVoiceCopilot?: () => void;
}

export const HowToOperateModal: React.FC<HowToOperateModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateTab,
  onOpenVoiceCopilot,
}) => {
  const { userProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(userProfile?.role || 'farmer');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.role) {
      setSelectedRole(userProfile.role);
    }
    setActiveStep(0);
  }, [userProfile?.role, isOpen]);

  if (!isOpen) return null;

  const isHindi = language === 'hi';

  const roleGuides: Record<
    UserRole,
    {
      title: string;
      subtitle: string;
      badge: string;
      color: string;
      steps: {
        number: number;
        title: string;
        desc: string;
        targetTab: string;
        actionLabel: string;
        voiceText: string;
        keyPoints: string[];
      }[];
    }
  > = {
    farmer: {
      title: isHindi ? 'किसान संचालन मार्गदर्शिका' : 'Farmer Operating Guide',
      subtitle: isHindi
        ? 'फसल सूचीबद्ध करें, एआई गुणवत्ता जांचें और बैंक एस्क्रो से तत्काल भुगतान पाएं'
        : 'List harvest lots, scan AGMARK quality, and get guaranteed instant bank payout upon weighbridge scale clearance',
      badge: isHindi ? 'अन्नदाता वर्कफ़्लो' : 'Farmer Workflow',
      color: 'emerald',
      steps: [
        {
          number: 1,
          title: isHindi ? 'एआई अनाज गुणवत्ता निरीक्षण' : 'AI Grain Quality Inspection',
          desc: isHindi
            ? 'अपनी फसल (गेहूं, सोयाबीन, धान आदि) की स्पष्ट फोटो खींचें। जेमिनी 3.8 फ्लैश मॉडल सरकारी एगमार्क ग्रेड-1 (IS: 1488) और नमी का सटीक विश्लेषण करेगा।'
            : 'Capture or upload a clear photo of your grain lot. Gemini 3.8 Flash performs optical defect detection, moisture estimation, and AGMARK Grade-1 standard certification.',
          targetTab: 'farmer-listing',
          actionLabel: isHindi ? 'गुणवत्ता स्कैनर खोलें' : 'Open Quality Scanner',
          voiceText: isHindi
            ? 'पहला कदम: अपनी फसल की फोटो खींचें। एआई अनाज गुणवत्ता स्कैनर तुरंत नमी, कचरा और एगमार्क ग्रेड प्रमाणित करता है।'
            : 'Step one: Capture a photo of your grain sample. The AI inspector instantly certifies moisture, dockage, and AGMARK grade standards.',
          keyPoints: [
            isHindi ? 'नमी प्रतिशत (<12% आदर्श)' : 'Moisture % detection (<12% FAQ target)',
            isHindi ? 'कचरा व अशुद्धि माप (Dockage)' : 'Dockage & foreign matter calculation',
            isHindi ? 'एगमार्क ग्रेड-1 प्रमाणपत्र' : 'Official AGMARK Grade-1 benchmark',
          ],
        },
        {
          number: 2,
          title: isHindi ? 'थोक फसल लॉट सूचीबद्ध करें' : 'List Harvest Crop for Wholesale',
          desc: isHindi
            ? 'फसल की किस्म, कुल मात्रा (टन में) और अपना अपेक्षित भाव दर्ज करें। अपनी बैंक खाता या यूपीआई विवरण लिंक करें ताकि तौल होते ही पैसा सीधे खाते में आए।'
            : 'Specify crop variety, quantity in metric tons, and expected rate. Link your Bank IFSC or UPI ID for direct 60-second automated disbursement.',
          targetTab: 'farmer-listing',
          actionLabel: isHindi ? 'फसल लॉट बनाएं' : 'Create Crop Listing',
          voiceText: isHindi
            ? 'दूसरा कदम: फसल की किस्म, मात्रा और भाव दर्ज करें और अपना बैंक या यूपीआई खाता जोड़ें।'
            : 'Step two: Enter crop variety, quantity in tons, your target price, and verify your bank account or UPI.',
          keyPoints: [
            isHindi ? 'सीधे थोक मिलों से बिक्री' : 'Direct trade with certified wholesale buyers',
            isHindi ? 'बिचौलियों की कोई कमीशन नहीं' : 'Zero middleman commission deductions',
            isHindi ? 'सत्यापित बैंक / यूपीआई सुरक्षा' : 'Verified Bank / KCC account link',
          ],
        },
        {
          number: 3,
          title: isHindi ? 'खरीदार 100% बैंक एस्क्रो लॉक' : 'Buyer Funds 100% Escrow Vault',
          desc: isHindi
            ? 'जब कोई थोक मिल आपकी फसल स्वीकार करती है, तो पूरा 100% भुगतान स्वतंत्र बैंक एस्क्रो वॉल्ट में तुरंत लॉक हो जाता है। आपका पैसा 100% सुरक्षित है।'
            : 'Once a buyer locks a deal, 100% of the funds are deposited into an independent banking escrow vault before dispatch. Zero default risk.',
          targetTab: 'farmer-dashboard',
          actionLabel: isHindi ? 'किसान डैशबोर्ड देखें' : 'View Farmer Desk',
          voiceText: isHindi
            ? 'तीसरा कदम: खरीदार 100% धन बैंक एस्क्रो वॉल्ट में लॉक करता है। फसल भेजने से पहले आपका पैसा पूरी तरह सुरक्षित रहता है।'
            : 'Step three: Buyer capital is 100% locked in bank escrow before dispatch, guaranteeing zero financial risk.',
          keyPoints: [
            isHindi ? 'पूरी राशि बैंक वॉल्ट में सुरक्षित' : '100% buyer capital locked in bank vault',
            isHindi ? 'डिफ़ॉल्ट या गैर-भुगतान का शून्य जोखिम' : 'Zero payment default or bouncing risk',
            isHindi ? 'डिजिटल ट्रेड अनुबंध' : 'Legally binding digital trade contract',
          ],
        },
        {
          number: 4,
          title: isHindi ? 'अधिकृत तौल पुल पर वजन सत्यापन' : 'Weighbridge Gross & Tare Clearance',
          desc: isHindi
            ? 'ट्रक को पंजीकृत एपीएमसी तौल पुल पर ले जाएं। इलेक्ट्रॉनिक पिटलेस स्केल पर सकल (Gross) और खाली (Tare) वजन का डिजिटल साइन-ऑफ होगा।'
            : 'Transport harvest to the certified electronic pitless weighbridge. Official platform scale measures gross and tare tonnage without manual interference.',
          targetTab: 'farmer-dashboard',
          actionLabel: isHindi ? 'डिलीवरी स्थिति ट्रैक करें' : 'Track Order Status',
          voiceText: isHindi
            ? 'चौथा कदम: अधिकृत तौल पुल पर इलेक्ट्रॉनिक वजन होता है और डिजिटल पर्ची बनती है।'
            : 'Step four: Certified weighbridge measures gross and tare weight on electronic scales, generating a digital weight slip.',
          keyPoints: [
            isHindi ? 'छेड़छाड़-मुक्त इलेक्ट्रॉनिक स्केल' : 'Tamper-proof pitless electronic scale',
            isHindi ? 'नमी व कचरे का भौतिक मिलान' : 'Moisture meter calibration matching',
            isHindi ? 'डिजिटल तौल पर्ची (Slip)' : 'Instant digital weight slip generation',
          ],
        },
        {
          number: 5,
          title: isHindi ? 'स्वतः 60 सेकंड में बैंक भुगतान' : 'Instant 60-Sec Automated Payout',
          desc: isHindi
            ? 'जैसे ही तौल पुल ऑपरेटर वजन डिजिटल रूप से सत्यापित करता है, बैंक एस्क्रो सीधे आपके बैंक खाते या यूपीआई में पूरी राशि स्वतः भेज देता है।'
            : 'The moment electronic scale verification is submitted, the bank escrow vault automatically disburses net payment to your bank/UPI within 60 seconds.',
          targetTab: 'farmer-dashboard',
          actionLabel: isHindi ? 'भुगतान रिकॉर्ड देखें' : 'View Settlement Record',
          voiceText: isHindi
            ? 'पांचवां कदम: तौल होते ही बैंक एस्क्रो स्वतः 60 सेकंड में पैसा आपके खाते में ट्रांसफर कर देता है।'
            : 'Step five: Upon scale clearance, funds are automatically wired to your bank or UPI account in 60 seconds.',
          keyPoints: [
            isHindi ? 'तत्काल एनईएफटी / आरटीजीएस / यूपीआई' : 'Instant NEFT / RTGS / UPI settlement',
            isHindi ? 'भुगतान रसीद व लेजर ऑडिट' : 'Audit-ready payment receipts & tax slips',
            isHindi ? 'शून्य देरी, शून्य कटौती' : 'Zero payment delays or unapproved deductions',
          ],
        },
      ],
    },
    buyer: {
      title: isHindi ? 'थोक खरीदार संचालन मार्गदर्शिका' : 'Wholesale Buyer Operating Guide',
      subtitle: isHindi
        ? 'एगमार्क प्रमाणित फसल खोजें, सुरक्षित एस्क्रो में पूंजी लॉक करें और जोखिम-मुक्त डिलीवरी लें'
        : 'Procure AGMARK-certified grain lots, lock capital in neutral bank escrow, and track freight telemetry with guaranteed weight clearance',
      badge: isHindi ? 'खरीदार वर्कफ़्लो' : 'Buyer Workflow',
      color: 'blue',
      steps: [
        {
          number: 1,
          title: isHindi ? 'मांग (RFQ) पोस्ट करें या अनाज मंडी देखें' : 'Post RFQ Demand or Browse Mart',
          desc: isHindi
            ? 'अपनी आवश्यक फसल (गेहूं, सोयाबीन, मक्का), आवश्यक टन और स्वीकार्य मूल्य की मांग पोस्ट करें, या किसानों द्वारा सूचीबद्ध एगमार्क ग्रेड-1 लॉट देखें।'
            : 'Publish customized procurement demands (crop, variety, required tonnage, price) or browse certified harvest listings verified by farmers.',
          targetTab: 'buyer-demands',
          actionLabel: isHindi ? 'खरीद मांग (RFQ) पोस्ट करें' : 'Post Procurement RFQ',
          voiceText: isHindi
            ? 'पहला कदम: अपनी खरीद आवश्यकता पोस्ट करें या सत्यापित एगमार्क लॉट देखें।'
            : 'Step one: Post your procurement demand or explore AGMARK-graded harvest lots directly from farmer collectives.',
          keyPoints: [
            isHindi ? 'क्षेत्रीय एआई संकलन (Clustering)' : 'AI Regional Aggregation clustering',
            isHindi ? 'एगमार्क लैब ग्रेड और नमी रिपोर्ट' : 'Verified AGMARK grade & moisture reports',
            isHindi ? 'थोक मिल मूल्य निर्धारण' : 'Direct bulk wholesale price discovery',
          ],
        },
        {
          number: 2,
          title: isHindi ? 'तटस्थ बैंक एस्क्रो में पूंजी जमा करें' : 'Deposit Capital into Escrow Vault',
          desc: isHindi
            ? 'सौदा तय होने पर 100% खरीद राशि सुरक्षित बैंक एस्क्रो में जमा करें। जब तक अधिकृत तौल पुल पर माल की पुष्टि नहीं होती, आपकी पूंजी सुरक्षित है।'
            : 'Lock 100% of purchase capital in our partner banking escrow vault. Your capital remains protected until certified weighbridge verification occurs.',
          targetTab: 'buyer-dashboard',
          actionLabel: isHindi ? 'खरीदार डैशबोर्ड देखें' : 'Open Buyer Dashboard',
          voiceText: isHindi
            ? 'दूसरा कदम: सौदा तय होने पर बैंक एस्क्रो में धन जमा करें। माल तौले जाने तक आपकी पूंजी सुरक्षित रहती है।'
            : 'Step two: Lock funds in neutral bank escrow. Your capital stays safe in the banking vault until goods pass certified weighing.',
          keyPoints: [
            isHindi ? 'तटस्थ बैंक खाता सुरक्षा' : 'Partner bank neutral escrow custody',
            isHindi ? 'वजन कम होने पर आनुपातिक रिफंड' : 'Automatic pro-rata refund for weight deficit',
            isHindi ? 'जीएसटी और ई-वे बिल संगत' : 'GST and e-Way bill compliant billing',
          ],
        },
        {
          number: 3,
          title: isHindi ? 'माल ढुलाई व लॉजिस्टिक्स ट्रैकिंग' : 'Track Freight Dispatch & Telemetry',
          desc: isHindi
            ? 'ट्रक प्रस्थान, ड्राइवर संपर्क, जीपीएस कॉरिडोर और अनुमानित आगमन समय (ETA) की लाइव निगरानी करें।'
            : 'Monitor dispatch notifications, driver credentials, GPS transit corridor, and estimated arrival time at the designated weighbridge.',
          targetTab: 'marketplace',
          actionLabel: isHindi ? 'थोक मंडी देखें' : 'View Wholesale Mart',
          voiceText: isHindi
            ? 'तीसरा कदम: ट्रक प्रस्थान और लॉजिस्टिक्स की लाइव निगरानी करें।'
            : 'Step three: Track vehicle transit, driver contact, and real-time weighbridge arrival schedules.',
          keyPoints: [
            isHindi ? 'वास्तविक समय में वाहन ट्रैकिंग' : 'Real-time transit corridor monitoring',
            isHindi ? 'ड्राइवर व वाहन लाइसेंस सत्यापन' : 'Driver license & truck plate validation',
            isHindi ? 'मौसम व मार्ग सुरक्षा अलर्ट' : 'Weather & route congestion telemetry',
          ],
        },
        {
          number: 4,
          title: isHindi ? 'तौल पुल पुष्टि व गुणवत्ता ऑडिट' : 'Weighbridge Gross/Tare Confirmation',
          desc: isHindi
            ? 'तौल पुल इलेक्ट्रॉनिक वजन और भौतिक नमूना जांच दर्ज करता है। यदि वजन कम निकलता है, तो एस्क्रो स्वतः अतिरिक्त राशि आपके खाते में लौटा देता है।'
            : 'The independent weighbridge logs certified electronic gross and tare scale weights. Pro-rata adjustments protect you against transit shrinkage.',
          targetTab: 'buyer-dashboard',
          actionLabel: isHindi ? 'ऑर्डर स्थिति देखें' : 'Review Active Orders',
          voiceText: isHindi
            ? 'चौथा कदम: तौल पुल वास्तविक वजन दर्ज करता है, जिससे वजन में किसी भी कमी से आपका नुकसान नहीं होता।'
            : 'Step four: Independent electronic scale weights are verified, guaranteeing you pay only for net delivered grain.',
          keyPoints: [
            isHindi ? 'इलेक्ट्रॉनिक स्केल वजन रसीद' : 'Electronic tare & gross weight slip',
            isHindi ? 'नमी व कचरा सहनशीलता जांच' : 'Tolerance adherence against agreed spec',
            isHindi ? 'कमी होने पर स्वतः धन वापसी' : 'Instant automated pro-rata refund on shortfall',
          ],
        },
      ],
    },
    logistics: {
      title: isHindi ? 'तौल पुल ऑपरेटर संचालन मार्गदर्शिका' : 'Weighbridge Terminal Operating Guide',
      subtitle: isHindi
        ? 'इलेक्ट्रॉनिक स्केल पर सकल/खाली वजन दर्ज करें, नमी मापें और डिजिटल वजन पर्ची जारी करें'
        : 'Perform tamper-proof gross & tare weighing, calibrate moisture readings, and issue certified digital scale slips to trigger escrow disburse',
      badge: isHindi ? 'तौल टर्मिनल वर्कफ़्लो' : 'Weighbridge Workflow',
      color: 'amber',
      steps: [
        {
          number: 1,
          title: isHindi ? 'ट्रक आगमन व ट्रैकिंग आईडी स्कैन' : 'Scan Truck License & Tracking ID',
          desc: isHindi
            ? 'टर्मिनल पर ट्रक आगमन पर ट्रैकिंग आईडी या वाहन नंबर दर्ज करें। संबंधित एस्क्रो ऑर्डर की पूरी जानकारी स्क्रीन पर आ जाएगी।'
            : 'When the freight truck reaches your scale pit, enter or scan the tracking ID. Full contract specs (crop, declared tonnage) load instantly.',
          targetTab: 'verification',
          actionLabel: isHindi ? 'तौल टर्मिनल खोलें' : 'Open Weighbridge Terminal',
          voiceText: isHindi
            ? 'पहला कदम: वाहन आगमन पर ट्रैकिंग आईडी दर्ज करें और डिजिटल अनुबंध लोड करें।'
            : 'Step one: Enter the tracking ID to fetch declared tonnage and trade contract details.',
          keyPoints: [
            isHindi ? 'एपीएमसी गेट लाइसेंस सत्यापन' : 'APMC terminal gate license verification',
            isHindi ? 'घोषित वजन व किस्म का मिलान' : 'Declared tonnage & crop variety loading',
            isHindi ? 'चालक पहचान पत्र सत्यापन' : 'Driver phone & consignment manifest check',
          ],
        },
        {
          number: 2,
          title: isHindi ? 'सकल (Gross) वजन व नमी जांच' : 'Gross Electronic Scale Weighing',
          desc: isHindi
            ? 'भरे हुए ट्रक को इलेक्ट्रॉनिक प्लेटफॉर्म पर रखें और सकल वजन दर्ज करें। डिजिटल नमी मीटर से 3 नमूनों का औसत मापें।'
            : 'Direct loaded truck onto electronic pitless scale to capture gross tonnage. Sample grain with probe and record average moisture meter reading.',
          targetTab: 'verification',
          actionLabel: isHindi ? 'सकल वजन रिकॉर्ड करें' : 'Record Scale Weight',
          voiceText: isHindi
            ? 'दूसरा कदम: भरे ट्रक का सकल वजन लें और डिजिटल नमी मीटर से जांच करें।'
            : 'Step two: Measure loaded truck gross weight on the electronic scale and test moisture content.',
          keyPoints: [
            isHindi ? 'पिटलेस इलेक्ट्रॉनिक लोड सेल स्केल' : 'Pitless electronic load-cell measurement',
            isHindi ? 'नमी मीटर रीडिंग (<12% FAQ)' : 'Moisture meter reading verification',
            isHindi ? 'कचरा व अशुद्धि नमूना परीक्षण' : 'Visual inspection for foreign dockage',
          ],
        },
        {
          number: 3,
          title: isHindi ? 'खाली (Tare) वजन व शुद्ध मात्रा' : 'Tare Weighing & Net Certified Weight',
          desc: isHindi
            ? 'अनाज खाली होने के बाद खाली ट्रक का वजन (Tare) लें। शुद्ध वजन स्वतः निकल आता है। डिजिटल वजन पर्ची पर साइन-ऑफ करें।'
            : 'After cargo is discharged at the silo, measure empty truck tare weight. The system calculates exact certified net tonnage.',
          targetTab: 'verification',
          actionLabel: isHindi ? 'वजन प्रमाणित करें' : 'Certify Final Weight',
          voiceText: isHindi
            ? 'तीसरा कदम: खाली ट्रक का वजन लें और डिजिटल पर्ची जारी कर एस्क्रो भुगतान जारी करें।'
            : 'Step three: Weigh the empty truck for tare weight and sign off to trigger instant escrow disbursement.',
          keyPoints: [
            isHindi ? 'सटीक शुद्ध वजन (Net = Gross - Tare)' : 'Precise Net Tonnage = Gross - Tare',
            isHindi ? 'डिजिटल प्रमाण-पत्र व क्यूआर कोड' : 'Digital certificate with cryptographic signature',
            isHindi ? 'एस्क्रो स्वतः रिलीज ट्रिगर' : 'Automatic escrow disburse trigger',
          ],
        },
      ],
    },
    admin: {
      title: isHindi ? 'विवाद निवारण ट्रिब्यूनल मार्गदर्शिका' : 'Arbitration & Governance Guide',
      subtitle: isHindi
        ? 'व्यापार विवादों की समीक्षा करें, तौल पुल व एगमार्क साक्ष्यों की जांच करें और बाध्यकारी निर्णय दें'
        : 'Review trade disputes, cross-reference immutable weighbridge logs and AGMARK records, and execute legally binding escrow settlements',
      badge: isHindi ? 'ट्रिब्यूनल वर्कफ़्लो' : 'Tribunal Workflow',
      color: 'purple',
      steps: [
        {
          number: 1,
          title: isHindi ? 'शिकायत व विवाद टिकट समीक्षा' : 'Review Dispute Tickets',
          desc: isHindi
            ? 'किसान, खरीदार या लॉजिस्टिक्स द्वारा दर्ज किए गए विवाद टिकटों की समीक्षा करें (जैसे नमी अंतर, वजन विसंगति या पारगमन क्षति)।'
            : 'Inspect open arbitration tickets raised by farmers or buyers regarding weight variance, quality discrepancies, or delivery transit delays.',
          targetTab: 'grievances',
          actionLabel: isHindi ? 'विवाद डेस्क खोलें' : 'Open Dispute Desk',
          voiceText: isHindi
            ? 'पहला कदम: खुले विवाद टिकटों की समीक्षा करें और पक्षों के दावे देखें।'
            : 'Step one: Review open arbitration tickets and examine the claims submitted by both trading parties.',
          keyPoints: [
            isHindi ? 'वजन विसंगति शिकायतें' : 'Weight discrepancy & tare audits',
            isHindi ? 'गुणवत्ता विनिर्देश अंतर' : 'Quality specification variance',
            isHindi ? 'एस्क्रो सुरक्षा रोक (Freeze)' : 'Automatic escrow freeze during dispute',
          ],
        },
        {
          number: 2,
          title: isHindi ? 'तौल पुल व एगमार्क साक्ष्य मिलान' : 'Cross-Examine Immutable Records',
          desc: isHindi
            ? 'तौल पुल इलेक्ट्रॉनिक स्केल डेटा, ड्राइवर टाइमस्टैम्प और प्रारंभिक एआई एगमार्क फोटो रिपोर्ट का निष्पक्ष ऑडिट करें।'
            : 'Cross-examine certified weighbridge weight slips, driver arrival timestamps, and the initial AI AGMARK inspection photo.',
          targetTab: 'grievances',
          actionLabel: isHindi ? 'साक्ष्य जांचें' : 'Examine Evidence',
          voiceText: isHindi
            ? 'दूसरा कदम: तौल पुल के डिजिटल रिकॉर्ड और एगमार्क लैब रिपोर्ट का मिलान करें।'
            : 'Step two: Cross-reference certified weighbridge telemetry and original grain quality photos.',
          keyPoints: [
            isHindi ? 'डिजिटल वजन पर्ची डेटा' : 'Digital scale ticket timestamps',
            isHindi ? 'शुरुआती एआई निरीक्षण रिपोर्ट' : 'Original AI Grain inspection matrix',
            isHindi ? 'एपीएमसी मंडी अनुबंध नियम' : 'Governing APMC Mandi contract terms',
          ],
        },
        {
          number: 3,
          title: isHindi ? 'अंतिम कानूनी निर्णय व एस्क्रो निपटान' : 'Issue Verdict & Settle Escrow',
          desc: isHindi
            ? 'अपना न्यायिक फैसला दर्ज करें। सिस्टम एस्क्रो धनराशि को आपके फैसले के अनुसार किसान और खरीदार के खातों में तुरंत विभाजित और वितरित कर देता है।'
            : 'Record binding arbitration judgment. The escrow vault automatically executes split disbursements according to your ruling.',
          targetTab: 'grievances',
          actionLabel: isHindi ? 'फैसला लागू करें' : 'Execute Settlement',
          voiceText: isHindi
            ? 'तीसरा कदम: अपना फैसला दर्ज करें। बैंक एस्क्रो स्वतः धनराशि का निपटान कर देता है।'
            : 'Step three: Record binding arbitration verdict to automatically release or adjust escrow funds.',
          keyPoints: [
            isHindi ? 'बाध्यकारी कानूनी समाधान' : 'Legally binding tribunal verdict',
            isHindi ? 'आनुपातिक एस्क्रो विभाजन' : 'Automated pro-rata escrow execution',
            isHindi ? 'स्थायी ऑडिट लॉग' : 'Permanent audit compliance trail',
          ],
        },
      ],
    },
  };

  const currentGuide = roleGuides[selectedRole];
  const currentStep = currentGuide.steps[activeStep] || currentGuide.steps[0];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const handleNavigate = (tab: string, role: UserRole) => {
    handleStopAudio();
    onClose();
    onNavigateTab(tab, role);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {isHindi ? 'एग्रीसेल संचालन गाइड व वर्कफ़्लो' : 'How to Operate Agricel Platform'}
                </h3>
                <span className="text-[10px] bg-amber-400/20 border border-amber-300/40 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  {isHindi ? 'संपूर्ण मार्गदर्शिका' : 'Complete Interactive Guide'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {isHindi
                  ? 'किसान, खरीदार, तौल पुल और ट्रिब्यूनल के 100% सुरक्षित एस्क्रो नियम'
                  : 'Master the end-to-end escrow trade lifecycle across all 4 roles'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVoiceCopilot && (
              <button
                onClick={() => {
                  handleStopAudio();
                  onClose();
                  onOpenVoiceCopilot();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md transition-all transform hover:scale-105"
              >
                <Mic className="w-3.5 h-3.5 text-slate-900" />
                <span>{isHindi ? 'लाइव वॉयस से पूछें' : 'Ask Live Voice'}</span>
              </button>
            )}
            <button
              onClick={() => {
                handleStopAudio();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              { role: 'farmer', label: isHindi ? 'किसान' : 'Farmer', icon: Tractor, color: 'emerald' },
              { role: 'buyer', label: isHindi ? 'थोक खरीदार' : 'Wholesale Buyer', icon: Store, color: 'blue' },
              { role: 'logistics', label: isHindi ? 'तौल पुल ऑपरेटर' : 'Weighbridge Operator', icon: Scale, color: 'amber' },
              { role: 'admin', label: isHindi ? 'ट्रिब्यूनल / प्रशासक' : 'Arbitrator / Admin', icon: ShieldCheck, color: 'purple' },
            ] as const
          ).map((item) => {
            const isSelected = selectedRole === item.role;
            const Icon = item.icon;
            return (
              <button
                key={item.role}
                onClick={() => {
                  setSelectedRole(item.role);
                  setActiveStep(0);
                  handleStopAudio();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700 ring-2 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Role Header Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
                  {currentGuide.badge}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {currentGuide.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
                {currentGuide.subtitle}
              </p>
            </div>

            {/* Listen Button */}
            <button
              onClick={() => handleSpeak(`${currentStep.title}. ${currentStep.voiceText}`)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-auto shrink-0 shadow-xs ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? (isHindi ? 'ध्वनि रोकें' : 'Stop Audio') : isHindi ? 'कदम सुनें' : 'Listen to Step'}</span>
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {currentGuide.steps.map((s, idx) => {
              const isCurrent = idx === activeStep;
              const isPast = idx < activeStep;
              return (
                <button
                  key={s.number}
                  onClick={() => {
                    setActiveStep(idx);
                    handleStopAudio();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : isPast
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                      : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : isPast
                          ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isPast ? '✓' : s.number}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Step {s.number}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-slate-800 dark:text-slate-200 truncate">
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {currentStep.number}
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {currentStep.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isHindi ? 'विस्तृत संचालन निर्देश' : 'Detailed operational directives'}
                  </p>
                </div>
              </div>

              {/* Direct Action Navigation Button */}
              <button
                onClick={() => handleNavigate(currentStep.targetTab, selectedRole)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto transform hover:scale-105"
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {currentStep.desc}
            </p>

            {/* Key Checklist & Standards */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {isHindi ? 'महत्वपूर्ण सुरक्षा व प्रक्रिया बिंदु:' : 'Key Safeguards & Operating Checklist:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentStep.keyPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeStep === 0}
                onClick={() => {
                  setActiveStep((prev) => Math.max(0, prev - 1));
                  handleStopAudio();
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isHindi ? '← पिछला कदम' : '← Previous Step'}
              </button>

              <div className="text-xs text-slate-400 font-bold">
                {activeStep + 1} / {currentGuide.steps.length}
              </div>

              {activeStep < currentGuide.steps.length - 1 ? (
                <button
                  onClick={() => {
                    setActiveStep((prev) => Math.min(currentGuide.steps.length - 1, prev + 1));
                    handleStopAudio();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>{isHindi ? 'अगला कदम →' : 'Next Step →'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate(currentStep.targetTab, selectedRole)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
                >
                  <span>{isHindi ? 'वर्कस्पेस में जाएं' : 'Enter Workspace'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-medium">
              {isHindi
                ? '100% बैंक एस्क्रो सुरक्षा व अधिकृत तौल पुल द्वारा समर्थित'
                : 'Secured by 100% Neutral Bank Escrow & Electronic Pitless Scale Weighing'}
            </span>
          </div>

          {onOpenVoiceCopilot && (
            <button
              onClick={() => {
                handleStopAudio();
                onClose();
                onOpenVoiceCopilot();
              }}
              className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'एग्रीसेंस कोपायलट से आवाज में पूछें' : 'Ask AgriSense Voice Copilot'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
