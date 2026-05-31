import { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileImage, X, Activity, Download, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, analyzing, success, error
  const [result, setResult] = useState(null);
  const [showGradcam, setShowGradcam] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const loadMockFile = async () => {
    try {
      const response = await fetch('/uploads/be8c2d2b-b671-4c06-a8f4-e9446e198c21.jpeg');
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const mockFile = new File([blob], 'demo_retinal_scan.jpeg', { type: 'image/jpeg' });
      processFile(mockFile);
    } catch (err) {
      console.error("Failed to load mock file", err);
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Outfit';
      ctx.fillText('Demo Retinal Scan', 50, 150);
      canvas.toBlob((blob) => {
        const fallbackFile = new File([blob], 'demo_fallback.jpeg', { type: 'image/jpeg' });
        processFile(fallbackFile);
      }, 'image/jpeg');
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('idle');
      setResult(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    
    setStatus('analyzing');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/api/predict/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const downloadReport = async () => {
    // Calling our report generator logic
    if(!result) return;
    try {
        const res = await axios.post(`${API_URL}/api/report/generate`, result);
        const url = res.data.report_url;
        window.open(`${API_URL}${url}`, '_blank');
    } catch(err) {
        console.error("Failed to generate report", err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 overflow-x-hidden">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fundus Image Analysis</h1>
        <p className="text-slate-400">Upload an image to get AI-powered diagnostic insights.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Controls */}
        <div className="space-y-6">
          <div 
            className={`glass-panel border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative overflow-hidden ${
              isDragging ? 'border-primary bg-primary/5' : 'border-slate-700/50 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative rounded-xl overflow-hidden group aspect-video bg-black/40 flex items-center justify-center">
                <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                    className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-800">
                  <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Image</h3>
                <p className="text-slate-400 mb-6 text-sm">Supports JPEG, PNG (Max 5MB)</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                   <button 
                     onClick={() => fileInputRef.current.click()}
                     className="bg-transparent border border-primary/40 hover:bg-primary/5 text-primary-dark px-6 py-2 rounded-lg font-medium transition-colors"
                   >
                     Browse Files
                   </button>
                   <button 
                     id="test-load-mock"
                     onClick={loadMockFile}
                     className="bg-teal-600/20 border border-teal-500/30 hover:bg-teal-600/30 text-teal-300 px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     Load Demo Retinal Scan
                   </button>
                 </div>
              </div>
            )}
            <input 
              type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png" 
            />
          </div>

          <AnimatePresence>
            {file && status === 'idle' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              >
                <button 
                  onClick={analyzeImage}
                  className="w-full bg-gradient-to-r from-primary to-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" /> Run AI Diagnosis
                </button>
              </motion.div>
            )}

            {status === 'analyzing' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                 <div className="relative w-16 h-16">
                   <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                   <div className="absolute inset-2 rounded-full border-b-2 border-blue-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                   <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                 </div>
                 <p className="text-slate-300 font-medium">Analyzing image structure...</p>
               </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-center">
                An error occurred during analysis. Please try again or use a different image.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Results */}
        <div>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] glass-panel rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center"
              >
                <FileImage className="w-16 h-16 mb-4 opacity-50" />
                <p>Upload an image and run the diagnosis to see the AI analysis, severity grading, and explainable heatmap here.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Primary Diagnosis Card */}
                <div className="glass-panel p-6 rounded-2xl border-l-4" style={{ borderLeftColor: result.severity_details.color }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Primary Diagnosis</p>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-dark), ${result.severity_details.color})` }}>
                        {result.prediction}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium mb-1">Confidence</p>
                      <div className="text-2xl font-bold" style={{ color: result.severity_details.color }}>
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-surface/50 rounded-xl p-4 mt-4 border border-white/5">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {result.severity_details.desc}
                    </p>
                  </div>
                </div>

                {/* Heatmap Viewer */}
                <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold flex items-center gap-2"><Eye className="w-4 h-4"/> Interpretability (Grad-CAM)</h3>
                    <div className="flex items-center gap-2 text-sm bg-slate-900/5 p-1 rounded-lg">
                      <button onClick={() => setShowGradcam(false)} className={`px-3 py-1 rounded-md transition-colors ${!showGradcam ? 'bg-primary/20 text-primary-dark font-medium' : 'text-slate-400 hover:text-slate-100'}`}>Original</button>
                      <button onClick={() => setShowGradcam(true)} className={`px-3 py-1 rounded-md transition-colors ${showGradcam ? 'bg-primary/20 text-primary-dark font-medium' : 'text-slate-400 hover:text-slate-100'}`}>Heatmap</button>
                    </div>
                  </div>
                  
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
                    <img src={preview} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
                    
                    <AnimatePresence>
                      {showGradcam && result.heatmap_base64 && (
                        <motion.img 
                          initial={{ opacity: 0 }} animate={{ opacity: heatmapOpacity }} exit={{ opacity: 0 }}
                          src={result.heatmap_base64} alt="Heatmap" className="absolute inset-0 w-full h-full object-contain mix-blend-screen" 
                        />
                      )}
                    </AnimatePresence>

                    {/* Quick Opacity Slider on Hover */}
                    {showGradcam && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur block p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-slate-800 flex items-center gap-3 px-4 shadow-lg">
                        <Layers className="w-4 h-4 text-slate-400"/>
                        <input 
                          type="range" min="0" max="1" step="0.05" value={heatmapOpacity}
                          onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                          className="w-24 accent-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Confidence Distribution */}
                <div className="glass-panel p-6 rounded-2xl h-64">
                   <h3 className="font-semibold mb-4 text-sm text-slate-400 uppercase tracking-wider">Class Probabilities</h3>
                   <ResponsiveContainer width="100%" height="80%">
                     <BarChart data={Object.entries(result.class_probs).map(([name, prob]) => ({ name: name.split(':')[0], fullName: name, prob: prob * 100 }))} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#475569', fontSize: 12}} />
                       <Tooltip cursor={{fill: 'rgba(20, 184, 166, 0.05)'}} contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(15, 118, 110, 0.25)', borderRadius: '12px', color: '#1e293b'}} formatter={(value) => [`${value.toFixed(1)}%`, 'Probability']} />
                       <Bar dataKey="prob" radius={[0, 4, 4, 0]} maxBarSize={20}>
                         {Object.entries(result.class_probs).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry[0] === result.prediction ? result.severity_details.color : 'var(--color-slate-700)'} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    onClick={downloadReport}
                    className="flex-1 bg-surface border border-primary/20 hover:border-primary/50 text-primary-dark hover:bg-primary/5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Download PDF Report
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Upload;
