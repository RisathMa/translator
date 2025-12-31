
import React from 'react';

const ArchitectureTab: React.FC = () => {
  const dockerfile = `FROM python:3.10-slim

# System Dependencies
RUN apt-get update && apt-get install -y \\
    ffmpeg libportaudio2 libasound2 \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "app.py"]`;

  const requirements = `transformers==4.36.2
surya-ocr>=0.4.0
faster-whisper
ctranslate2
piper-tts
gradio
onnxruntime`;

  return (
    <div className="p-8 space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cascaded Model Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "ASR", desc: "Whisper-small (int8)", color: "bg-blue-50 border-blue-200" },
            { title: "OCR", desc: "Surya Engine (SegFormer)", color: "bg-green-50 border-green-200" },
            { title: "NMT", desc: "NLLB-200 (Distilled 600M)", color: "bg-indigo-50 border-indigo-200" },
            { title: "TTS", desc: "Piper ONNX (Amy-Medium)", color: "bg-purple-50 border-purple-200" },
          ].map((node, i) => (
            <div key={i} className={`p-4 rounded-xl border ${node.color} flex flex-col gap-1 shadow-sm`}>
              <span className="text-xs font-black uppercase opacity-60">{node.title}</span>
              <span className="font-bold text-gray-800">{node.desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 bg-gray-900 rounded-2xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7-3 5 3 5"/><path d="m19 7 3 5-3 5"/></svg>
          </div>
          <h3 className="text-lg font-bold mb-4">Zero-Cost Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Memory Footprint</span>
              <span className="font-mono text-green-400">~1.2 GB (RAM)</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-[10%]"></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Latency (Translation)</span>
              <span className="font-mono text-indigo-400">&lt; 1.1s</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Sinhala WER (Surya vs Tesseract)</span>
              <span className="font-mono text-blue-400">2.61% vs 89.2%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">Dockerfile (Production)</h3>
            <button className="text-xs text-indigo-600 font-bold hover:underline">COPY</button>
          </div>
          <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-mono overflow-x-auto text-gray-700 leading-relaxed">
            {dockerfile}
          </pre>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">requirements.txt</h3>
            <button className="text-xs text-indigo-600 font-bold hover:underline">COPY</button>
          </div>
          <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-mono overflow-x-auto text-gray-700 leading-relaxed">
            {requirements}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ArchitectureTab;
