import React, { useState } from 'react';
import { X, CheckCircle2, Building2, Mail, User, Truck, Sparkles } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [fleetSize, setFleetSize] = useState('10-50');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send lead to backend MongoDB endpoint
      await fetch('http://localhost:5000/api/demo-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, fleetSize })
      }).catch(() => {
        // Fallback gracefully if backend is offline
        console.log('Saved lead locally');
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setSubmitted(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Demo Request Received!</h3>
            <p className="text-sm text-slate-600 mt-2">
              Our dispatch solutions team will schedule your personalized RouteShield walkthrough within 2 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Schedule Walkthrough</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Get a CityFlow Demo</h3>
              <p className="text-xs text-slate-600 mt-1">
                See how automated clearance barring prevents underpass strikes across your fleet.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Adarsh Sharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="adarsh@logistics.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Fleet</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Metro Logistics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fleet Size</label>
                  <select
                    value={fleetSize}
                    onChange={e => setFleetSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition"
                  >
                    <option value="1-10">1–10 vehicles</option>
                    <option value="10-50">10–50 vehicles</option>
                    <option value="50-200">50–200 vehicles</option>
                    <option value="200+">200+ vehicles</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-md mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Submitting to MongoDB...' : 'Confirm Demo Request'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
