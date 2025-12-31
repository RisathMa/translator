
import React, { useState, useRef, useEffect } from 'react';
import { translateImage } from '../services/gemini';
import { LANGUAGES } from '../constants';

const CameraTab: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 2048 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please ensure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }
  };

  const captureAndTranslate = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setCapturedImage(base64);
    setIsLoading(true);
    setTranslation('');

    try {
      const result = await translateImage(base64, targetLang);
      setTranslation(result);
    } catch (err) {
      console.error(err);
      setTranslation("Error processing image.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visual Translation</h2>
          <p className="text-gray-500">Surya-enhanced OCR for complex scripts like Sinhala.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-xl w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 ml-2">TARGET:</span>
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-white border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none flex-grow"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-inner group">
          {isCameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : capturedImage ? (
            <img src={capturedImage} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
              <div className="p-4 bg-gray-900 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </div>
              <button onClick={startCamera} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Open Camera
              </button>
            </div>
          )}

          {isCameraActive && (
            <button 
              onClick={captureAndTranslate}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 active:scale-90 transition-transform shadow-xl flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-red-500 rounded-full"></div>
            </button>
          )}

          {(isCameraActive || capturedImage) && (
            <button 
              onClick={() => { stopCamera(); setCapturedImage(null); setTranslation(''); }}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-grow bg-gray-50 border border-gray-200 rounded-2xl p-6 overflow-y-auto min-h-[300px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detected Text & Translation</h3>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="animate-pulse">Processing Multimodal Pipeline...</p>
              </div>
            ) : translation ? (
              <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                {translation}
              </div>
            ) : (
              <div className="text-gray-300 italic text-center mt-20">
                Snap a photo to extract and translate text instantly
              </div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraTab;
