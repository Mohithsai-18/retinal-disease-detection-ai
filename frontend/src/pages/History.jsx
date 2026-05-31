import { useState, useEffect } from 'react';
import { Search, User, Calendar, Clock, ChevronRight, X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

const getRiskFromStatus = (status) => {
  if (!status) return 'Low';
  const s = status.toLowerCase();
  if (s.includes('proliferative') || s.includes('grade 4') || s.includes('amd')) return 'High';
  if (s.includes('grade 2') || s.includes('grade 3') || s.includes('glaucoma')) return 'Moderate';
  return 'Low';
};

const AddPatientModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    first_name: '', last_name: '', dob: '', gender: 'Male', history: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.dob) {
      setError('First name, last name, and date of birth are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/patients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create patient');
      }
      const patient = await res.json();
      onSaved(patient);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative glass-panel rounded-2xl p-8 w-full max-w-lg z-10 border border-slate-800"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-900 transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">New Patient Record</h2>
          <p className="text-slate-400 text-sm mt-1">Add a new patient to the retinal screening database.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">First Name *</label>
              <input
                type="text" name="first_name" value={form.first_name} onChange={handleChange}
                placeholder="e.g. Arjun"
                className="w-full bg-surface border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Last Name *</label>
              <input
                type="text" name="last_name" value={form.last_name} onChange={handleChange}
                placeholder="e.g. Sharma"
                className="w-full bg-surface border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Date of Birth *</label>
              <input
                type="date" name="dob" value={form.dob} onChange={handleChange}
                className="w-full bg-surface border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Gender</label>
              <select
                name="gender" value={form.gender} onChange={handleChange}
                className="w-full bg-surface border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Medical History (optional)</label>
            <textarea
              name="history" value={form.history} onChange={handleChange}
              placeholder="e.g. Type 2 Diabetes, Hypertension..."
              rows={3}
              className="w-full bg-surface border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100 placeholder:text-slate-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Save Patient</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const History = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/patients/`);
      if (!res.ok) throw new Error('Failed to load patients');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientSaved = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  const filteredData = patients.filter(p =>
    (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <AddPatientModal
            onClose={() => setShowModal(false)}
            onSaved={handlePatientSaved}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto pb-12">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Patient Directory</h1>
            <p className="text-slate-400">Manage patient records and scan history. ({patients.length} patients)</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add New Patient
          </button>
        </header>

        <div className="glass-panel p-6 rounded-2xl mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>Loading patients from database...</span>
          </div>
        )}

        {!loading && error && (
          <div className="glass-panel rounded-2xl p-8 text-center border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-semibold mb-1">Could not connect to database</p>
            <p className="text-slate-500 text-sm">{error}</p>
            <button onClick={fetchPatients} className="mt-4 px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors text-sm font-medium">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold mb-1">No patients found</p>
            <p className="text-slate-500 text-sm">
              {searchTerm ? 'No results match your search.' : 'Click "Add New Patient" to get started.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredData.map((patient, i) => {
              const risk = getRiskFromStatus(patient.history);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={patient.id}
                  className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:bg-slate-900 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-surface border border-slate-800 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 w-full gap-4 items-center">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Name</p>
                      <p className="font-semibold">{patient.first_name} {patient.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> DOB</p>
                      <p>{patient.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Registered</p>
                      <p>{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Gender</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${risk === 'High' ? 'bg-red-500' : risk === 'Moderate' ? 'bg-amber-500' : 'bg-green-500'}`} />
                        <span className="font-medium text-slate-100">{patient.gender}</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default History;
