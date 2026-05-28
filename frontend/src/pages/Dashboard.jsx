import { Activity, Upload, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, subtitle, icon: Icon, colorClass, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-${colorClass}/20 transition-colors duration-500`}></div>
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-slate-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className={`text-sm text-${colorClass}`}>{subtitle}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-${colorClass}/20 shadow-lg shadow-${colorClass}/10`}>
        <Icon className={`w-6 h-6 text-${colorClass}`} />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const stats = [
    { title: "Total Scans Analyzed", value: "1,284", subtitle: "+12% this month", icon: Activity, colorClass: "primary" },
    { title: "High Risk Detected", value: "142", subtitle: "Requires attention", icon: AlertTriangle, colorClass: "amber-500" },
    { title: "Normal Scans", value: "856", subtitle: "No anomalies", icon: ShieldCheck, colorClass: "blue-500" }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-10">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Retinal AI</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg"
        >
          AI-assisted diagnosis for Diabetic Retinopathy, Glaucoma, and AMD.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 border-primary/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="flex-1 z-10 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-4">Start a New Diagnosis</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Upload a retinal fundus image. Our advanced EfficientNet-B4 model will analyze the scan, detect potential diseases, and provide an explainable Grad-CAM heatmap highlighting anomalous regions.
            </p>
            <Link 
              to="/upload" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all w-full justify-center md:w-auto"
            >
              <Upload className="w-5 h-5" />
              Upload Scan Now
            </Link>
          </div>
          <div className="flex-1 w-full relative z-10 hidden md:block">
            {/* Decorative element replacing image for premium feel */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
               <div className="absolute inset-4 rounded-full border border-primary/30 [mask-image:linear-gradient(transparent,white)]"></div>
               <div className="absolute inset-8 rounded-full border border-blue-500/30"></div>
               <div className="absolute inset-12 rounded-full bg-surface/80 backdrop-blur-sm border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                 <ScanLine />
               </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { patient: "John D.", result: "DR Grade 2", time: "2h ago", alert: true },
              { patient: "Sarah M.", result: "Normal", time: "5h ago", alert: false },
              { patient: "Robert K.", result: "Glaucoma", time: "1d ago", alert: true },
              { patient: "Emily W.", result: "DR Grade 1", time: "1d ago", alert: false },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.alert ? 'bg-amber-500' : 'bg-primary'}`}></div>
                  <div>
                    <p className="font-medium text-sm text-slate-200">{activity.patient}</p>
                    <p className={`text-xs ${activity.alert ? 'text-amber-400' : 'text-slate-400'}`}>{activity.result}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-primary transition-colors border border-white/5 rounded-lg hover:bg-white/5">
            View All History
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// SVG Animated scan line component
const ScanLine = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-primary opacity-80 p-4">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
      <path d="M 50 10 L 50 90 M 10 50 L 90 50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
      <circle cx="50" cy="50" r="30" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
      <motion.line 
        x1="20" y1="50" x2="80" y2="50" 
        stroke="#3b82f6" strokeWidth="2"
        initial={{ y1: 20, y2: 20, opacity: 0 }}
        animate={{ y1: 80, y2: 80, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
      />
    </svg>
)

export default Dashboard;
