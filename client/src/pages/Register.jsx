import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Other'];

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'bystander', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.city) { setError('Please select your city'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      login(data.token, data.user);
      navigate('/');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pakistan-green flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-green-200 text-sm mt-1">Join the CPR Pakistan network</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Muhammad Ali"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pakistan-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="03XX-XXXXXXX"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pakistan-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Choose a password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pakistan-green"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={form.city}
                onChange={set('city')}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pakistan-green"
                required
              >
                <option value="">Select your city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: 'bystander' }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.role === 'bystander' ? 'border-pakistan-green bg-green-50 text-pakistan-green' : 'border-gray-200 text-gray-600'}`}
                >
                  <div className="text-2xl mb-1">👤</div>
                  <div>Bystander</div>
                  <div className="text-xs text-gray-500 urdu">عام شہری</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: 'provider' }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.role === 'provider' ? 'border-pakistan-green bg-green-50 text-pakistan-green' : 'border-gray-200 text-gray-600'}`}
                >
                  <div className="text-2xl mb-1">🏥</div>
                  <div>BLS Provider</div>
                  <div className="text-xs text-gray-500 urdu">تربیت یافتہ</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pakistan-green text-white font-semibold py-3 rounded-lg hover:bg-pakistan-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-pakistan-green font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
