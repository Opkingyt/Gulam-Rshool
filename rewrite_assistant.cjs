const fs = require('fs');
let content = fs.readFileSync('src/components/AIAssistantScreen.tsx', 'utf8');

// Add Radio to lucide-react imports
content = content.replace('Mic } from \'lucide-react\'', 'Mic, Radio } from \'lucide-react\'');

content = content.replace(
  'const [isListening, setIsListening] = useState(false);',
  `const [isListening, setIsListening] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const isLiveModeRef = useRef(false);
  const inputRef = useRef('');
  
  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);
  
  useEffect(() => {
    inputRef.current = input;
  }, [input]);
`
);

content = content.replace(
  `        recognition.onend = () => {
          setIsListening(false);
        };`,
  `        recognition.onend = () => {
          setIsListening(false);
          // Auto-send in live mode if there's input
          if (isLiveModeRef.current && inputRef.current.trim().length > 0) {
            document.getElementById('ai-send-btn')?.click();
          } else if (isLiveModeRef.current && inputRef.current.trim().length === 0) {
            // Restart listening if we got nothing and still in live mode
            setTimeout(() => {
              if (isLiveModeRef.current && !isListening) {
                 try { recognition.start(); setIsListening(true); } catch(e){}
              }
            }, 500);
          }
        };`
);

content = content.replace(
  `  const speakText = useCallback((text: string) => {`,
  `  const speakText = useCallback((text: string) => {`
);

content = content.replace(
  `    window.speechSynthesis.speak(utterance);
  }, [isSpeechEnabled]);`,
  `    utterance.onend = () => {
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
  }, [isSpeechEnabled]);`
);


content = content.replace(
  `              <Send className="w-5 h-5" />
            </button>`,
  `              <Send className="w-5 h-5" />
            </button>`
);

content = content.replace(
  `onClick={handleSend}`,
  `id="ai-send-btn" onClick={handleSend}`
);


content = content.replace(
  `        <button
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}`,
  `        <div className="flex items-center gap-2">
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
            className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition \${
              isLiveMode 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 animate-pulse' 
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
            }\`}
          >
            <Radio className="w-4 h-4" />
            {isLiveMode ? 'Live On' : 'Live Off'}
          </button>
        <button
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}`
);

content = content.replace(
  `          {isSpeechEnabled ? 'Voice On' : 'Voice Off'}
        </button>
      </div>`,
  `          {isSpeechEnabled ? 'Voice On' : 'Voice Off'}
        </button>
        </div>
      </div>`
);


fs.writeFileSync('src/components/AIAssistantScreen.tsx', content);
console.log('done');
