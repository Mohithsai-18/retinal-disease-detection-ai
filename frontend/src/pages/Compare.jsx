import { useState } from 'react';
import { RefreshCw, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Compare = () => {
  // Mock data for progression comparison to demonstrate functionality
  const [isComparing, setIsComparing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const downloadReport = async () => {
    if (!resultData) return;
    setIsGeneratingPdf(true);
    try {
      const res = await axios.post(`${API_URL}/api/report/generate/compare`, resultData);
      const url = res.data.report_url;
      window.open(`${API_URL}${url}`, '_blank');
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const performComparison = async () => {
    setIsComparing(true);
    setShowResult(false);
    try {
      const response = await axios.post(`${API_URL}/api/compare/progression`, {
        baseline_id: "demo_base",
        current_id: "demo_current"
      });
      setResultData(response.data);
      setShowResult(true);
    } catch (err) {
      console.error("Comparison failed:", err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Longitudinal Scan Comparison</h1>
        <p className="text-slate-400">Track disease progression over time by comparing multiple scans from the same patient.</p>
      </header>

      <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex-1 flex items-center gap-4">
          <select className="bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white w-full max-w-xs focus:ring-1 focus:ring-primary focus:outline-none">
            <option>Select Patient</option>
            <option selected>Holden, James (ID: P-002)</option>
            <option>Nagata, Naomi (ID: P-003)</option>
          </select>
        </div>
        <button 
          onClick={performComparison}
          disabled={isComparing}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isComparing ? <RefreshCw className="w-5 h-5 animate-spin"/> : "Analyze Progression"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Baseline Scan */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="bg-surface/80 p-4 border-b border-white/5 flex justify-between items-center">
             <div>
               <h3 className="font-semibold text-slate-200">Baseline Scan</h3>
               <p className="text-xs text-slate-400">Oct 12, 2025</p>
             </div>
             <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold">
               Moderate NPDR
             </span>
          </div>
          <div className="aspect-square bg-black relative flex items-center justify-center p-2">
            {/* Using a placeholder gradient to represent retinal scan */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-900/40 to-orange-900/20 blur-sm flex items-center justify-center border border-amber-500/10">
               <span className="text-amber-500/30 font-bold">SCAN PREVIEW</span>
            </div>
          </div>
        </div>

        {/* Current Scan */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="bg-surface/80 p-4 border-b border-white/5 flex justify-between items-center">
             <div>
               <h3 className="font-semibold text-slate-200">Current Scan</h3>
               <p className="text-xs text-slate-400">Apr 01, 2026</p>
             </div>
             <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold">
               Proliferative DR
             </span>
          </div>
          <div className="aspect-square bg-black relative flex items-center justify-center p-2">
             <div className="w-full h-full rounded-full bg-gradient-to-br from-red-900/40 to-rose-900/20 blur-sm flex items-center justify-center border border-red-500/20">
               {/* Simulating grad-cam hot spots for progression */}
               <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-red-500/40 rounded-full blur-xl"></div>
               <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-orange-500/30 rounded-full blur-xl"></div>
               <span className="text-red-500/30 font-bold relative z-10">SCAN PREVIEW</span>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isComparing && (
           <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex flex-col items-center justify-center py-8">
             <Activity className="w-8 h-8 text-primary animate-pulse mb-4" />
             <p className="text-slate-300">Comparing lesion density and neo-vascularization...</p>
           </motion.div>
        )}

        {showResult && resultData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`glass-panel p-8 rounded-2xl border-t-4 ${resultData.severity_progression.worsened ? 'border-t-red-500' : 'border-t-amber-500'}`}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className={resultData.severity_progression.worsened ? "text-red-500" : "text-amber-500"} /> Progression Detected
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface/50 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-slate-400 mb-1">{resultData.metrics.microaneurysms.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{resultData.metrics.microaneurysms.baseline}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500"/>
                  <span className="text-2xl font-bold text-red-400">{resultData.metrics.microaneurysms.current}</span>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 flex items-center rounded">+{resultData.metrics.microaneurysms.change_pct}%</span>
                </div>
              </div>
              <div className="bg-surface/50 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-slate-400 mb-1">{resultData.metrics.exudates.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{resultData.metrics.exudates.baseline} {resultData.metrics.exudates.unit}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500"/>
                  <span className="text-2xl font-bold text-amber-400">{resultData.metrics.exudates.current} {resultData.metrics.exudates.unit}</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 flex items-center rounded">+{resultData.metrics.exudates.change_pct}%</span>
                </div>
              </div>
              <div className="bg-surface/50 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-slate-400 mb-1">{resultData.metrics.neovascularization.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-500">{resultData.metrics.neovascularization.baseline}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500"/>
                  <span className="text-2xl font-bold text-red-500">{resultData.metrics.neovascularization.current}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
              <strong>Clinical Assessment:</strong> {resultData.clinical_assessment}
            </div>
            
            <button 
              onClick={downloadReport}
              disabled={isGeneratingPdf}
              className="mt-6 w-full bg-surface hover:bg-white/5 border border-white/10 text-white tracking-wide font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPdf ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}
              Generate Comparison Report (PDF)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Compare;
