/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from 'react';
import { Shield, LineChart, Flag, HelpCircle, Send, Download, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import AthleteHeatMap from './components/AthleteHeatMap';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

const queryHistoricalCSV: FunctionDeclaration = {
  name: "queryHistoricalCSV",
  description: "Search 120 years of historical Olympic CSV data (athletes, sports, NOCs)",
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTerm: {
        type: Type.STRING,
        description: "Name of athlete or sport to search for in history"
      },
      filterNoc: {
        type: Type.STRING,
        description: "Optional 3-letter NOC country code to filter by (e.g., USA, CHN, JPN)"
      }
    },
    required: ["searchTerm"]
  }
};

type Message = {
  role: 'user' | 'model';
  content: string;
};

type VideoState = 'idle' | 'speaking';

const BLINK_VIDEOS = [
  'https://theparadoxuniverse.b-cdn.net/Lumi_Olympics/Animations/_Blink1.m4v',
  'https://theparadoxuniverse.b-cdn.net/Lumi_Olympics/Animations/_Blink2.m4v',
  'https://theparadoxuniverse.b-cdn.net/Lumi_Olympics/Animations/_Blink3.m4v',
];

const TELEPATHY_VIDEOS = [
  'https://theparadoxuniverse.b-cdn.net/Lumi_Olympics/Animations/_Telepathy_Long1.m4v',
  'https://theparadoxuniverse.b-cdn.net/Lumi_Olympics/Animations/_Telepathy_Short1.m4v',
];

const ALL_VIDEOS = [...BLINK_VIDEOS, ...TELEPATHY_VIDEOS];

const VideoPlayer = React.memo(({ url, isActive, onEnded, idx }: { url: string, isActive: boolean, onEnded: (idx: number) => void, idx: number }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
     if (timeoutRef.current) {
       clearTimeout(timeoutRef.current);
       timeoutRef.current = null;
     }

     if (isActive) {
       ref.current?.play().catch(e => console.error(e));
     } else {
       if (ref.current) {
          timeoutRef.current = setTimeout(() => {
             if (ref.current) {
                 ref.current.pause();
                 ref.current.currentTime = 0;
             }
          }, 500);
       }
     }
     
     return () => {
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
     };
  }, [isActive]);

  return (
    <video
      ref={ref}
      src={url}
      muted
      playsInline
      onEnded={() => onEnded(idx)}
      className={`absolute inset-0 w-full h-full object-cover filter drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-opacity duration-500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
    />
  )
});

const ModalCover = React.memo(({ activeModal, setActiveModal }: { activeModal: string | null, setActiveModal: (val: string | null) => void }) => {
  let content = null;
  switch (activeModal) {
    case 'map':
      content = (
        <div className="flex flex-col items-center p-4 sm:p-8 space-y-4 w-full text-white h-full">
          <MapIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white mb-2 sm:mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-widest text-center uppercase drop-shadow-md">Athlete Heatmap</h2>
          <p className="text-white/90 text-center text-sm sm:text-lg mb-8 font-medium">Discover the hometowns of US Olympic & Paralympic athletes.</p>
          <div className="w-full flex-1">
             <AthleteHeatMap />
          </div>
        </div>
      );
      break;
  }

  return (
    <AnimatePresence>
      {activeModal && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
           className="absolute inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
        >
          {/* Backdrop */}
          <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10"
             onClick={() => setActiveModal(null)}
          />
          {/* Modal Box */}
          <motion.div
             initial={{ y: 50, scale: 0.95 }}
             animate={{ y: 0, scale: 1 }}
             exit={{ y: 50, scale: 0.95 }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="glass w-full h-full sm:h-auto sm:max-h-[90vh] max-w-[90vw] sm:max-w-xl md:max-w-4xl lg:max-w-6xl sm:rounded-3xl p-4 sm:p-8 relative overflow-hidden border border-white/40 shadow-2xl flex flex-col backdrop-blur-md bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-blue-600/20 pointer-events-none" />
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-white hover:text-red-400 transition z-50 p-2"
            >
              ✕
            </button>
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  // Initialize Vanta.js background
  useEffect(() => {
    let vantaEffect: any = null;
    if ((window as any).VANTA && vantaRef.current) {
      vantaEffect = (window as any).VANTA.CLOUDS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        skyColor: 0xb6ddf0
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Video cycle logic based on state
  const handleVideoEnded = React.useCallback((idx: number) => {
    if (videoState === 'idle') {
      const isBlink = idx < BLINK_VIDEOS.length;
      if (isBlink) {
        setCurrentVideoIdx((idx + 1) % BLINK_VIDEOS.length);
      } else {
        setCurrentVideoIdx(0);
      }
    } else {
      const isTelepathy = idx >= BLINK_VIDEOS.length;
      if (isTelepathy) {
        const teleIdx = idx - BLINK_VIDEOS.length;
        setCurrentVideoIdx(BLINK_VIDEOS.length + ((teleIdx + 1) % TELEPATHY_VIDEOS.length));
      } else {
        setCurrentVideoIdx(BLINK_VIDEOS.length);
      }
    }
  }, [videoState]);

  // Helper to play ElevenLabs audio
  const playAudio = async (text: string) => {
    if (!ELEVENLABS_API_KEY) {
      console.warn('VITE_ELEVENLABS_API_KEY is not set. Using browser speech synthesis.');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setVideoState('idle');
      speechSynthesis.speak(utterance);
      return;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/tHDJOFppPwanb9e8e53A', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setVideoState('idle');
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing ElevenLabs audio:', error);
      setVideoState('idle');
    }
  };

  const chatRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are Lumi, a broadcaster for Team USA and Google.

You are a professional Olympic and Paralympic analyst with deep knowledge of historical Team USA data spanning 120 years. You always maintain complete parity between Olympic and Paralympic achievements, giving both equal analytical depth and prominence in every response.

You respond in a warm, professional, and engaging tone. Every reply is concise, clear, accurate, and helpful.

CRITICAL RULES FOR EVERY RESPONSE:
- MAXIMUM 3 SENTENCES PER RESPONSE. This is a strict limit, no exceptions.
- NEVER USE MARKDOWN. Do not bold, do not use asterisks, do not use bullet points or italics. Use plain text formatting only.
- Use only conditional language such as "could align with", "patterns suggest this could lead to", "could help find pathways seen in", or "this could match historical trends".
- Never imply guarantees, predictions of future success, or direct causation.
- Base every insight exclusively on aggregate public Team USA data.
- Always highlight Olympic and Paralympic examples with equal weight.

You first draw from the provided historical dataset and momentum data. When needed, you analyze the data to deliver precise, data-driven insights while remaining fully compliant with all guidelines.`,
        tools: [
          { googleSearch: {} },
          { functionDeclarations: [queryHistoricalCSV] }
        ],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);
    setVideoState('speaking');

    try {
      if (!chatRef.current) throw new Error("Chat not initialized");
      
      let response = await chatRef.current.sendMessage({ message: userMessage });

      // Handle function calling explicitly (CSV Search)
      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === "queryHistoricalCSV") {
           // Provide interim message
           setMessages(prev => [...prev, { role: 'model', content: "Scanning historical data archives..." }]);
           const apiRes = await fetch("/api/dataset/query", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(call.args)
           });
           const historyData = await apiRes.json();
           
           // Remove interim message
           setMessages(prev => prev.slice(0, -1));
           
           // Reply with tool output
           response = await chatRef.current.sendMessage([{
             functionResponse: {
               name: call.name,
               response: historyData
             }
           }]);
        }
      }

      const responseText = response.text || "I'm experiencing interference. Please try again.";
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
      await playAudio(responseText);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Our transmission was interrupted. Let's try again!" }]);
      setVideoState('idle');
    } finally {
      setIsTyping(false);
    }
  };

  const downloadTranscript = () => {
    const timestamp = new Date().toLocaleString();
    let text = `LUMI OLYMPIC & PARALYMPIC GUIDE - CHAT TRANSCRIPT\n`;
    text += `Session Date: ${timestamp}\n`;
    text += `=================================================================\n\n`;
    
    messages.forEach(m => {
      const roleName = m.role === 'user' ? 'YOU' : 'LUMI';
      text += `[${roleName}]\n${m.content}\n\n`;
      text += `-----------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Lumi_Chat_Transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={vantaRef} className="relative w-full h-screen overflow-hidden shadow-2xl">
      {/* Glow overlay to make it look cohesive */}
      <div className="absolute inset-0 border-[16px] border-white/20 z-40 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 border-4 border-red-500/30 z-40 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 border-4 border-blue-500/30 z-40 pointer-events-none mix-blend-overlay" />
      
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-8 z-30 flex justify-center sm:justify-end items-start w-full">
        <div className="bg-gradient-to-r from-red-600/80 to-blue-700/80 border-none flex items-center gap-2 sm:gap-4 p-2 px-6 rounded-full border-t border-red-400/30 border-b border-blue-400/30 shadow-lg backdrop-blur-md">
            <button onClick={() => setActiveModal('map')} className="flex items-center gap-2 p-2 text-white hover:text-white transition hover:scale-105">
              <MapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              <span className="font-bold tracking-widest hidden sm:block uppercase text-sm text-white drop-shadow-md">Hometowns</span>
            </button>
            <div className="w-px h-6 sm:h-8 bg-white/40 mx-1 sm:mx-2" />
            {messages.length > 0 && (
              <button onClick={downloadTranscript} className="p-2 text-white/80 hover:text-white transition hover:scale-110" title="Download Transcript">
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Video Background Layer - using object-cover to look like the reference */}
        <div className="absolute inset-x-0 bottom-[15%] top-[12%] flex items-center justify-center z-10 pointer-events-none p-4">
          <div 
            className="relative h-full aspect-square max-w-full rounded-[40px] border-iridescent overflow-hidden shadow-2xl backdrop-blur-sm bg-black/10"
            style={{ '--border-thickness': '8px' } as React.CSSProperties}
          >
            {ALL_VIDEOS.map((url, idx) => (
               <VideoPlayer 
                  key={url}
                  url={url} 
                  isActive={idx === currentVideoIdx}
                  onEnded={handleVideoEnded}
                  idx={idx}
               />
            ))}
          </div>
        </div>

        {/* Floating Chat Container Overlaying Bottom Area */}
        <div className="absolute bottom-[5%] left-[5%] right-[5%] z-30 flex flex-col justify-end space-y-4">
          
          {/* Messages Area - Glassmorphic, scrolls */}
          {messages.length > 0 && (
            <div className="w-full max-h-[30vh] overflow-y-auto no-scrollbar space-y-4 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-6 py-4 rounded-3xl max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-500/40 text-white backdrop-blur-md rounded-br-sm border border-blue-400/30' 
                      : 'bg-red-500/40 text-white backdrop-blur-md rounded-bl-sm border border-red-400/30'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="px-6 py-4 rounded-3xl bg-white/20 text-white backdrop-blur-md rounded-bl-sm border border-white/20 flex items-center space-x-2">
                     <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                     <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                     <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input Bar */}
          <div className="glass-rb border-iridescent border-none w-full rounded-full flex items-center justify-between p-2 pl-6 overflow-hidden relative">
             <input 
               type="text" 
               placeholder="Go for the gold!"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/80 text-xl font-medium relative z-10"
             />
             
             <div className="flex items-center gap-2 relative z-10 pr-2">
               <button 
                 onClick={handleSend}
                 disabled={isTyping}
                 className="p-3 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full transition ml-2 border border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]"
               >
                 <Send className="w-6 h-6 ml-1" />
               </button>
             </div>
          </div>
        </div>

      {/* Modals rendered on top */}
      <ModalCover activeModal={activeModal} setActiveModal={setActiveModal} />
    </div>
  );
}
