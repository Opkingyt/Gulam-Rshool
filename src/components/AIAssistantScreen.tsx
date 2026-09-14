import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, User, Loader2, Sparkles, Volume2, VolumeX, Mic, Radio } from 'lucide-react';
import { MenuItem, Bill, HotelSettings, TableOrder } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantScreenProps {
  menu: MenuItem[];
  bills: Bill[];
  settings: HotelSettings;
  tableOrders: TableOrder[];
  isBluetoothConnected: boolean;
  onNavigate?: (tab: any) => void;
  onPrintLatestOrder?: () => void;
  onUpdateMenuItem?: (itemName: string, newPrice?: number, newName?: string) => void;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({
  menu,
  bills,
  settings,
  tableOrders,
  isBluetoothConnected,
  onNavigate,
  onPrintLatestOrder,
  onUpdateMenuItem
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I am your AI Assistant. You can ask me about today's sales, menu items, orders, or printer status. How can I help you?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const isLiveModeRef = useRef(false);
  const inputRef = useRef('');
  
  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);
  
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Works great for both Hindi and English (Hinglish)

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access in your browser settings to use voice typing.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Auto-send in live mode if there's input
          if (isLiveModeRef.current && inputRef.current.trim().length > 0) {
            document.getElementById('ai-send-btn')?.click();
          } else if (isLiveModeRef.current && inputRef.current.trim().length === 0) {
            // Restart listening if we got nothing and still in live mode
            setTimeout(() => {
              if (isLiveModeRef.current && !isListening) {
                 try { recognitionRef.current.start(); setIsListening(true); } catch(e){}
              }
            }, 500);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setInput('');
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Sorry, your browser doesn't support Speech Recognition.");
      }
    }
  };

  // Initialize voices (often needed for Chrome to load them)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop current speech if any
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language to Hindi
    utterance.lang = 'hi-IN';
    
    // Try to find a specific Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('hi-IN'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    // Adjust rate and pitch for a more natural conversational tone
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // If live mode is on, resume listening after speaking
      if (isLiveModeRef.current) {
        setTimeout(() => {
          if (isLiveModeRef.current && recognitionRef.current) {
            try { 
              recognitionRef.current.start(); 
              setIsListening(true);
            } catch (e) {}
          }
        }, 500);
      }
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isSpeechEnabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const generateContext = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysBills = bills.filter(b => b.timestamp >= today);
    const totalSales = todaysBills.reduce((sum, b) => sum + b.total, 0);
    const activeOrders = tableOrders.filter(o => ['NEW', 'pending', 'accepted'].includes(o.status)).length;

    return `
Restaurant Name: ${settings.hotelName}
Bluetooth Printer Connected: ${isBluetoothConnected ? 'Yes' : 'No'}
Menu Items Count: ${menu.length}
Today's Total Sales: ₹${totalSales} (from ${todaysBills.length} bills)
Active Table Orders: ${activeOrders}
    `.trim();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: generateContext()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      speakText(data.reply);
      
      if (data.action) {
        if (data.action.name === 'navigateToScreen' && onNavigate) {
          onNavigate(data.action.args.screenName);
        } else if (data.action.name === 'printLatestOrder' && onPrintLatestOrder) {
          onPrintLatestOrder();
        } else if (data.action.name === 'updateMenuItem' && onUpdateMenuItem) {
          onUpdateMenuItem(data.action.args.itemName, data.action.args.newPrice, data.action.args.newName);
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            AI Assistant
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Powered by ChatGPT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newLiveMode = !isLiveMode;
              setIsLiveMode(newLiveMode);
              if (newLiveMode) {
                setIsSpeechEnabled(true);
                if (!isListening && recognitionRef.current) {
                  try { recognitionRef.current.start(); setIsListening(true); } catch(e) {}
                }
              } else {
                if (isListening && recognitionRef.current) {
                  recognitionRef.current.stop();
                  setIsListening(false);
                }
                window.speechSynthesis.cancel();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              isLiveMode 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 animate-pulse' 
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
            }`}
          >
            <Radio className="w-4 h-4" />
            {isLiveMode ? 'Live On' : 'Live Off'}
          </button>
        <button
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
            isSpeechEnabled 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
              : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
          }`}
        >
          {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {isSpeechEnabled ? 'Voice On' : 'Voice Off'}
        </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-4 flex gap-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-bl-sm border border-stone-200 dark:border-stone-600'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-stone-100 dark:bg-stone-700 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2 border border-stone-200 dark:border-stone-600">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-stone-500 dark:text-stone-400">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700">
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Start voice typing'}
              className={`p-3 rounded-xl transition flex items-center justify-center min-w-[52px] border ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse' 
                  : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about sales, menu, or orders..."
              className="flex-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 text-stone-900 dark:text-white placeholder-stone-400"
              disabled={isLoading}
            />
            <button
              id="ai-send-btn" onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition flex items-center justify-center min-w-[52px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
