import React, { useState } from 'react';
import { Card } from './ui/Card';
// Try to import analyzeFoodImage from services; if not available, provide a fallback stub
let analyzeFoodImage: (base64: string) => Promise<string> = async (_base64: string) => {
  return 'Analyzer service not available';
};

// Prefer static import path for bundlers; keep runtime fallback to avoid build errors
import * as groqService from '../services/groq';
if (groqService && typeof groqService.analyzeFoodImage === 'function') {
  analyzeFoodImage = groqService.analyzeFoodImage;
}
import { sanitizeAIText } from './aiText';

export function FoodAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setLoading(true);
    setResult(null);
    try {
      const base64 = preview.split(',')[1];
      const r = await analyzeFoodImage(base64);
      setResult(r);
    } catch (err) {
      setResult('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Food Analyzer</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Upload a photo to analyze nutrition</h2>
          </div>
          <div>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="h-64 w-full rounded-md bg-white/5 flex items-center justify-center">
            {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover rounded-md" /> : <div className="text-slate-400">No image uploaded</div>}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAnalyze} disabled={!preview || loading} className="rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">{loading ? 'Analyzing...' : 'Analyze Image'}</button>
            <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">Clear</button>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">Results</p>
          <div className="mt-3 text-sm text-slate-300">
            {result ? <div className="whitespace-pre-wrap break-words">{sanitizeAIText(result)}</div> : <div>No analysis yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default FoodAnalyzer;
