
import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import { translateText } from '../services/gemini';

const TextTab: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLangIdx, setSourceLangIdx] = useState(0); // English
  const [targetLangIdx, setTargetLangIdx] = useState(1); // Sinhala
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const target = LANGUAGES[targetLangIdx];
      const result = await translateText(inputText, target.floresCode);
      setOutputText(result);
    } catch (error) {
      console.error(error);
      setOutputText("Translation error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    const temp = sourceLangIdx;
    setSourceLangIdx(targetLangIdx);
    setTargetLangIdx(temp);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">From</label>
          <select 
            value={sourceLangIdx}
            onChange={(e) => setSourceLangIdx(parseInt(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {LANGUAGES.map((l, i) => <option key={l.code} value={i}>{l.name} ({l.floresCode})</option>)}
          </select>
        </div>
        
        <button 
          onClick={swapLanguages}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
        </button>

        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">To</label>
          <select 
            value={targetLangIdx}
            onChange={(e) => setTargetLangIdx(parseInt(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {LANGUAGES.map((l, i) => <option key={l.code} value={i}>{l.name} ({l.floresCode})</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        <div className="flex flex-col">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className="flex-grow p-4 bg-white border border-gray-200 rounded-xl resize-none text-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-300"
          />
        </div>

        <div className="flex flex-col relative">
          <div className="flex-grow p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-700 overflow-y-auto min-h-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full gap-3 text-gray-400">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                Mapping to FLORES-200...
              </div>
            ) : outputText || <span className="text-gray-300">Translation result</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Powered by Gemini 3 Pro • Optimized for sin_Sinh (Sinhala)
        </div>
        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-md"
        >
          {isLoading ? 'Processing...' : 'Translate Now'}
        </button>
      </div>
    </div>
  );
};

export default TextTab;
