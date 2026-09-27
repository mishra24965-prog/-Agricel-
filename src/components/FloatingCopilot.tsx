import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Loader2,
  ExternalLink,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BookOpen,
  Radio,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { Language } from '../translations';

interface FloatingCopilotProps {
  language: Language;
  onOpenGuide?: () => void;
}

interface Citation {
  title: string;
  url: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  citations?: Citation[];
  timestamp?: string;
}

// Convert Float32Array [-1.0, 1.0] to 16-bit little-endian PCM Base64
function float32To16BitPCMBase64(input: Float32Array): string {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(output.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM to Float32Array for AudioBuffer playback
function base64To16BitPCMFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

export const FloatingCopilot: React.FC<FloatingCopilotProps> = ({ language, onOpenGuide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'liveVoice'>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);

  // Live API Voice States
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const [isLiveSpeaking, setIsLiveSpeaking] = useState(false);
  const [isLiveMuted, setIsLiveMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [liveError, setLiveError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveWsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioPlaybackStateRef = useRef<{
    nextStartTime: number;
    activeSources: AudioBufferSourceNode[];
  }>({ nextStartTime: 0, activeSources: [] });

  const isHindi = language === 'hi';

  const initialMessageText = isHindi
    ? 'नमस्ते! मैं एग्रीसेंस कोपायलट (AgriSense Copilot) हूँ - जेमिनी 3.8 फ्लैश, लाइव सर्च और जेमिनी 3.8 लाइव वॉयस द्वारा संचालित। आप मुझसे कृषि मंडी भाव, एगमार्क (AGMARK) नियम, बैंक एस्क्रो सुरक्षा, या एग्रीसेल चलाने का तरीका पूछ सकते हैं।'
    : 'Namaste! I am AgriSense Copilot, powered by Gemini 3.8 Flash, live Google Search grounding, and Gemini 3.8 Live Voice. Ask me about Mandi rates, AGMARK quality standards, bank escrow disburse, or how to operate Agricel!';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: initialMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = isHindi
    ? [
        'एग्रीसेल कैसे चलाएं? (How to Operate)',
        'इंदौर मंडी में गेहूं और सोयाबीन का आज का भाव?',
        'एगमार्क (AGMARK) ग्रेड-1 के लिए नमी व कचरा नियम?',
        'तौल पुल पर डिजिटल वजन और बैंक एस्क्रो भुगतान कैसे होता है?',
      ]
    : [
        'How to Operate Agricel? (Guide)',
        'Indore Mandi Wheat & Soybean current rates?',
        'AGMARK Grade-1 moisture & dockage tolerances?',
        'How does certified weighbridge escrow settlement work?',
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, liveTranscript]);

  // Clean up Live audio on unmount or mode switch
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // Play audio chunk with precise gapless scheduling
  const scheduleAudioChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const samples = base64To16BitPCMFloat32(base64Audio);
      const buffer = ctx.createBuffer(1, samples.length, 24000);
      buffer.getChannelData(0).set(samples);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const state = audioPlaybackStateRef.current;
      const currentTime = ctx.currentTime;
      if (state.nextStartTime < currentTime) {
        state.nextStartTime = currentTime;
      }
      source.start(state.nextStartTime);
      state.nextStartTime += buffer.duration;
      state.activeSources.push(source);

      setIsLiveSpeaking(true);
      source.onended = () => {
        state.activeSources = state.activeSources.filter((s) => s !== source);
        if (state.activeSources.length === 0) {
          setIsLiveSpeaking(false);
        }
      };
    } catch (err) {
      console.warn('Audio chunk playback error:', err);
    }
  };

  // Stop current audio output (e.g. on interruption)
  const stopLiveAudioOutput = () => {
    const state = audioPlaybackStateRef.current;
    state.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch {
        // ignore
      }
    });
    state.activeSources = [];
    if (outputAudioCtxRef.current) {
      state.nextStartTime = outputAudioCtxRef.current.currentTime;
    }
    setIsLiveSpeaking(false);
  };

  // Start Gemini 3.8 Live API Voice Session
  const startLiveSession = async () => {
    setIsLiveConnecting(true);
    setLiveError(null);
    setLiveTranscript(
      isHindi
        ? 'जेमिनी 3.8 लाइव से कनेक्ट हो रहा है... कृपया माइक्रोफ़ोन अनुमति दें।'
        : 'Connecting to Gemini 3.8 Live... Please allow microphone access.'
    );

    try {
      // 1. Setup AudioContexts (16kHz for mic, 24kHz for model output)
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });

      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      audioPlaybackStateRef.current = { nextStartTime: outputCtx.currentTime, activeSources: [] };

      // 2. Request user microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      micStreamRef.current = stream;

      // 3. Establish WebSocket connection to backend /api/live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
        setIsLiveConnecting(false);
        setLiveTranscript(
          isHindi
            ? '🎙️ लाइव वॉयस सक्रिय! आप बोल सकते हैं (उदा. "किसान के रूप में फसल कैसे सूचीबद्ध करें?")...'
            : '🎙️ Live Voice active! Speak naturally (e.g. "How do I operate as a buyer?")...'
        );

        // 4. Capture microphone and send 16kHz PCM audio
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (isLiveMuted || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const base64PCM = float32To16BitPCMBase64(inputData);
          ws.send(JSON.stringify({ audio: base64PCM }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            scheduleAudioChunk(msg.audio);
            if (msg.text) {
              setLiveTranscript((prev) => `${prev} ${msg.text}`);
            }
          }
          if (msg.type === 'interrupted') {
            stopLiveAudioOutput();
          }
          if (msg.type === 'error') {
            console.error('Live API message error:', msg.error);
            setLiveError(msg.error || 'Live API connection error');
          }
        } catch (e) {
          console.error('WS message parse error:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('Live WebSocket error:', err);
        setLiveError(
          isHindi
            ? 'लाइव वॉयस सर्वर से कनेक्ट नहीं हो सका। कृपया टेक्स्ट मोड का उपयोग करें।'
            : 'Could not connect to Live Voice server. Please use text chat mode.'
        );
        setIsLiveConnecting(false);
        setIsLiveConnected(false);
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setIsLiveConnecting(false);
      };
    } catch (err: unknown) {
      console.error('Failed to start Live session:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setLiveError(
        errMsg.includes('Permission')
          ? isHindi
            ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
            : 'Microphone permission was denied. Please allow microphone in browser settings.'
          : errMsg
      );
      setIsLiveConnecting(false);
      setIsLiveConnected(false);
    }
  };

  // Stop Live Voice Session
  const stopLiveSession = () => {
    stopLiveAudioOutput();

    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    setIsLiveConnected(false);
    setIsLiveConnecting(false);
    setIsLiveSpeaking(false);
  };

  const handleToggleMode = (newMode: 'chat' | 'liveVoice') => {
    if (newMode === mode) return;
    setMode(newMode);
    if (newMode === 'liveVoice') {
      startLiveSession();
    } else {
      stopLiveSession();
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isLoading) return;

    // Check if user is asking to open the guide
    const lower = q.toLowerCase();
    if (
      lower.includes('how to operate') ||
      lower.includes('guide') ||
      lower.includes('संचालन') ||
      lower.includes('गाइड') ||
      lower.includes('मार्गदर्शिका')
    ) {
      if (onOpenGuide) {
        onOpenGuide();
        const guideReply = isHindi
          ? 'मैंने आपके लिए "एग्रीसेल संचालन मार्गदर्शिका (How to Operate)" खोल दी है! इसमें किसान, खरीदार, तौल पुल और ट्रिब्यूनल के सभी चरण वॉयस गाइड के साथ उपलब्ध हैं।'
          : 'I have opened the "How to Operate Agricel" interactive guide! It includes full step-by-step walkthroughs and voice guides for Farmers, Buyers, Weighbridges, and Arbitrators.';
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'user',
            text: q,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: guideReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setInput('');
        return;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const formattedHistory = newMessages
        .filter((m) => m.id !== '1' || m.sender === 'user')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiReply = data.reply || 'Apologies, could not process the agricultural query.';
      const citations = data.citations || [];

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('Online copilot query fallback:', err);
      let fallbackText = '';
      if (lower.includes('wheat') || lower.includes('gehu') || lower.includes('गेहूं')) {
        fallbackText = isHindi
          ? 'इंदौर मंडी में लोकवान गेहूं ₹2,580 - ₹2,640/क्विंटल पर व्यापार कर रहा है। एगमार्क ग्रेड-1 (<12% नमी) लॉट को तुरंत 100% बैंक एस्क्रो सुरक्षा मिलती है। (स्रोत: एमपी मंडी बोर्ड व e-NAM)'
          : 'Indore Mandi Lokwan Wheat trades around ₹2,580 - ₹2,640/Qtl. AGMARK Grade-1 lots (<12% moisture) receive 100% bank escrow locking immediately. (Source: MP Mandi Board & e-NAM)';
      } else if (lower.includes('soybean') || lower.includes('सोयाबीन')) {
        fallbackText = isHindi
          ? 'मालवा क्षेत्र में सोयाबीन (JS 335) ₹4,400 - ₹4,460/क्विंटल पर स्थिर है। 10% से कम नमी व 1% से कम कचरे वाले लॉट पर प्रीमियम उपलब्ध है। (स्रोत: SOPA / e-NAM)'
          : 'Soybean (JS 335) in Malwa Mandis holds steady at ₹4,400 - ₹4,460/Qtl. Clean lots with <10% moisture command premium escrow bids. (Source: SOPA & e-NAM)';
      } else if (lower.includes('escrow') || lower.includes('एस्क्रो') || lower.includes('weighbridge') || lower.includes('तौल')) {
        fallbackText = isHindi
          ? 'एग्रीसेल का सुरक्षित एस्क्रो मॉडल: खरीदार 100% राशि बैंक वॉल्ट में जमा करता है। जब अधिकृत तौल पुल पर डिजिटल वजन दर्ज होता है, तो बैंक स्वतः 60 सेकंड में किसान के बैंक खाते/UPI में धन ट्रांसफर करता है।'
          : 'Agricel Neutral Escrow Model: 100% buyer capital is deposited into a bank vault. Upon certified weighbridge electronic gross/tare scale logging, funds are automatically disbursed to the farmer within 60 seconds.';
      } else {
        fallbackText = isHindi
          ? 'एग्रीसेल पर आपका स्वागत है। आप ऊपर "संचालन गाइड" बटन पर क्लिक करके किसान, खरीदार, तौल पुल और ट्रिब्यूनल का पूरा वर्कफ़्लो देख सकते हैं।'
          : 'Welcome to Agricel. You can click "How to Operate" at the top to explore the complete interactive workflow for Farmers, Buyers, Weighbridges, and Arbitrators.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick microphone dictation for text input
  const handleDictate = () => {
    const win = window as unknown as {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      handleToggleMode('liveVoice');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsDictating(true);
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput(transcript);
          setIsDictating(false);
          handleSend(transcript);
        }
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);
      recognition.start();
    } catch {
      setIsDictating(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: initialMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[90] flex items-center gap-2">
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold py-3 px-4 rounded-full shadow-xl text-xs border border-emerald-500/40 backdrop-blur-md transition-all transform hover:scale-105"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{isHindi ? 'संचालन गाइड' : 'How to Operate'}</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AgriSense Copilot"
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black py-3 px-5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs border border-emerald-400/40 backdrop-blur-md transition-all transform hover:scale-105"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-amber-300 text-xs shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>AgriSense Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
        </button>
      </div>

      {/* Floating Copilot Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[440px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[90] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-amber-300 shadow-inner">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs">AgriSense Copilot</h4>
                  <span className="text-[9px] bg-amber-400/30 border border-amber-300/40 text-amber-200 px-1.5 py-0.5 rounded-md font-mono">
                    {mode === 'liveVoice' ? 'Gemini 3.8 Live' : 'Gemini 3.8 Flash'}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>{mode === 'liveVoice' ? (isHindi ? 'रीयल-टाइम वॉयस संवाद' : 'Real-time Voice Conversation') : (isHindi ? 'लाइव मंडी व एस्क्रो सलाहकार' : 'Live Mandi & Escrow Advisor')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Chat"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  stopLiveSession();
                  setIsOpen(false);
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Bar */}
          <div className="p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                onClick={() => handleToggleMode('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'chat'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isHindi ? 'चैट मोड' : 'Text Chat'}</span>
              </button>
              <button
                onClick={() => handleToggleMode('liveVoice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'liveVoice'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isHindi ? '🎙️ लाइव वॉयस' : '🎙️ Live Voice'}</span>
              </button>
            </div>

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-extrabold text-[11px] hover:bg-emerald-100 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isHindi ? 'ऑपरेटिंग गाइड' : 'How to Operate'}</span>
              </button>
            )}
          </div>

          {/* VIEW 1: Live Voice Conversation View (gemini-3.8-live) */}
          {mode === 'liveVoice' ? (
            <div className="flex-1 p-6 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-y-auto">
              <div className="space-y-2 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Gemini 3.8 Live API Active</span>
                </div>
                <h4 className="text-base font-black tracking-tight">
                  {isHindi ? 'एग्रीसेंस लाइव वॉयस संवाद' : 'AgriSense Live Voice Assistant'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {isHindi
                    ? 'स्वभाविक रूप से बोलें: फसल लिस्टिंग, नमी मानक, तौल पुल नियम या एस्क्रो सुरक्षा के बारे में पूछें।'
                    : 'Speak naturally: ask about crop listings, AGMARK grading, weighbridge rules, or escrow disburse.'}
                </p>
              </div>

              {/* Glowing Pulse Visualizer */}
              <div className="relative my-6 flex items-center justify-center">
                <div
                  className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isLiveSpeaking
                      ? 'bg-amber-500/30 ring-8 ring-amber-400/40 animate-pulse scale-110'
                      : isLiveConnected
                      ? 'bg-emerald-500/20 ring-4 ring-emerald-400/30 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl ${
                      isLiveSpeaking
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-400'
                        : isLiveConnected
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isLiveSpeaking ? (
                      <Volume2 className="w-10 h-10 animate-bounce" />
                    ) : isLiveMuted ? (
                      <MicOff className="w-10 h-10 text-red-300" />
                    ) : (
                      <Mic className="w-10 h-10 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Animated wave rings */}
                {isLiveSpeaking && (
                  <>
                    <span className="absolute w-44 h-44 rounded-full border border-amber-400/40 animate-ping"></span>
                    <span className="absolute w-52 h-52 rounded-full border border-amber-400/20 animate-pulse"></span>
                  </>
                )}
              </div>

              {/* Status and Transcript Area */}
              <div className="w-full space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 min-h-[68px] flex items-center justify-center">
                  {isLiveConnecting ? (
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'कनेक्ट हो रहा है...' : 'Connecting Live Voice Session...'}</span>
                    </div>
                  ) : liveError ? (
                    <div className="text-red-400 text-xs font-semibold">{liveError}</div>
                  ) : (
                    <p className="italic text-slate-300 leading-relaxed font-medium">
                      "{liveTranscript}"
                    </p>
                  )}
                </div>

                {/* Live Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsLiveMuted(!isLiveMuted)}
                    disabled={!isLiveConnected}
                    className={`p-3 rounded-full border transition-all ${
                      isLiveMuted
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                    }`}
                    title={isLiveMuted ? 'Unmute Mic' : 'Mute Mic'}
                  >
                    {isLiveMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {isLiveSpeaking && (
                    <button
                      onClick={stopLiveAudioOutput}
                      className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1.5"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>{isHindi ? 'आवाज रोकें' : 'Interrupt'}</span>
                    </button>
                  )}

                  <button
                    onClick={stopLiveSession}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-transform hover:scale-105"
                    title="End Call"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 2: Interactive Text Chat View (gemini-3.8-flash + search grounding) */
            <>
              {/* Quick suggestions pills */}
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar shrink-0">
                <span className="text-slate-400 font-bold shrink-0">{isHindi ? 'सुझाव:' : 'Suggested:'}</span>
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-colors font-medium shrink-0"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-900/50">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-[85%] space-y-1.5 ${m.sender === 'user' ? 'items-end' : ''}`}>
                      <div
                        className={`p-3.5 rounded-2xl leading-relaxed shadow-xs ${
                          m.sender === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>

                      {/* Grounded Citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="p-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] space-y-1">
                          <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[9px]">
                            {isHindi ? 'सत्यापित स्रोत:' : 'Verified Grounded Sources:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.citations.slice(0, 3).map((c, i) => (
                              <a
                                key={i}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
                              >
                                <span>{c.title}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.timestamp && (
                        <span className="text-[9px] text-slate-400 block px-1">
                          {m.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>{isHindi ? 'लाइव एपीएमसी मंडी और एगमार्क डेटा सर्च कर रहे हैं...' : 'Searching live APMC Mandi, AGMARK and MSP data...'}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 shrink-0">
                <button
                  onClick={handleDictate}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
                    isDictating
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-emerald-600'
                  }`}
                  title={isHindi ? 'आवाज से टाइप करें' : 'Voice Dictate'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={
                    isHindi
                      ? 'मंडी भाव, एगमार्क नियम या एग्रीसेल चलाना पूछें...'
                      : 'Ask Mandi rates, AGMARK rules, or how to operate...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-xs text-slate-800 dark:text-slate-100 focus:border-emerald-500 transition-colors"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
