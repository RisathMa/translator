
import React, { useState, useRef, useEffect } from 'react';
import { streamVoiceTranslation } from '../services/gemini';
import { decode, encode, decodeAudioData } from '../utils/audio';
import { LANGUAGES } from '../constants';

const VoiceTab: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [status, setStatus] = useState('Standby');
  const [targetLang, setTargetLang] = useState('Sinhala');
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      setIsListening(true);
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextInRef.current = inputCtx;
      audioContextOutRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = streamVoiceTranslation(targetLang, {
        onopen: () => {
          setStatus('Live: Speak now');
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            const base64 = message.serverContent.modelTurn.parts[0].inlineData.data;
            const buffer = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
            
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            
            activeSourcesRef.current.add(source);
            source.onended = () => activeSourcesRef.current.delete(source);
          }
          
          if (message.serverContent?.interrupted) {
            activeSourcesRef.current.forEach(s => s.stop());
            activeSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }

          if (message.serverContent?.inputTranscription) {
             setTranscript(prev => [...prev.slice(-10), { role: 'User', text: message.serverContent.inputTranscription.text }]);
          }
          if (message.serverContent?.outputTranscription) {
             setTranscript(prev => [...prev.slice(-10), { role: 'AI', text: message.serverContent.outputTranscription.text }]);
          }
        },
        onerror: (e: any) => {
          console.error(e);
          setStatus('Error');
          stopSession();
        },
        onclose: () => {
          setStatus('Standby');
          setIsListening(false);
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed');
      setIsListening(false);
    }
  };

  const stopSession = () => {
    sessionPromiseRef.current?.then(s => s.close());
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    setIsListening(false);
    setStatus('Standby');
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
        <div>
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Voice Mode</h3>
          <p className="text-xs text-indigo-600">Native Multimodal Pipeline Active</p>
        </div>
        <select 
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-white border-none rounded-lg py-1.5 px-3 text-sm font-medium text-indigo-900 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
        </select>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center py-10">
        <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${
          isListening ? 'scale-110 shadow-2xl' : 'scale-100'
        }`}>
           {isListening && (
             <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-25"></div>
           )}
           <button
            onClick={isListening ? stopSession : startSession}
            className={`z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${
              isListening ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
           >
             {isListening ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="12" height="12" x="6" y="6" rx="2"/></svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
             )}
           </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className={`text-xl font-bold ${isListening ? 'text-indigo-600' : 'text-gray-400'}`}>
            {status}
          </p>
          {!isListening && <p className="text-sm text-gray-400 mt-1">Tap to start real-time speech translation</p>}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 max-h-48 overflow-y-auto">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Transcription Engine (Whisper-Optimized)</h4>
        <div className="space-y-3">
          {transcript.length === 0 ? (
            <div className="flex items-center gap-2 text-gray-300 text-sm italic">
              <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
              Waiting for voice input...
            </div>
          ) : (
            transcript.map((line, i) => (
              <div key={i} className={`flex gap-3 text-sm animate-in slide-in-from-bottom-2`}>
                <span className={`font-bold w-12 shrink-0 ${line.role === 'User' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                  {line.role.toUpperCase()}
                </span>
                <span className="text-gray-700">{line.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceTab;
