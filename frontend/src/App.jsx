import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import Compare from './pages/Compare';
import BiomedicalBackground from './components/BiomedicalBackground';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-slate-100 relative">
      <BiomedicalBackground />
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
