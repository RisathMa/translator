import React, { useState } from 'react';
import { TranslationTab } from './types';
import { ICONS } from './constants';
import TextTab from './components/TextTab';
import VoiceTab from './components/VoiceTab';
import CameraTab from './components/CameraTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TranslationTab>(TranslationTab.TEXT);

  const renderTabContent = () => {
    switch (activeTab) {
      case TranslationTab.TEXT: return <TextTab />;
      case TranslationTab.VOICE: return <VoiceTab />;
      case TranslationTab.CAMERA: return <CameraTab />;
      default: return <TextTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ICONS.Layers />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Auto-Translator <span className="text-indigo-600">Pro</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-8">
            {[
              { id: TranslationTab.TEXT, label: 'Text', icon: <ICONS.Text /> },
              { id: TranslationTab.VOICE, label: 'Voice', icon: <ICONS.Mic /> },
              { id: TranslationTab.CAMERA, label: 'Camera', icon: <ICONS.Camera /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          Built for High-Performance Multimodal Deployment • CTranslate2 & int8 Quantized
        </div>
      </footer>
    </div>
  );
};

export default App;
