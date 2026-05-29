import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);

  const toggleAvailability = async () => {
    if (user.role !== 'provider') return;
    setToggling(true);
    try {
      const res = await fetch('/api/auth/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_available: !user.is_available }),
      });
      const data = await res.json();
      if (res.ok) updateUser({ is_available: data.is_available ? 1 : 0 });
    } finally {
      setToggling(false);
    }
  };

  const call1122 = () => { window.location.href = 'tel:1122'; };

  const shareWhatsApp = () => {
    if (!navigator.geolocation) { alert('Location not supported on this device'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const msg = `🚨 EMERGENCY! I need help at this location:\nhttps://maps.google.com/?q=${latitude},${longitude}\nPlease call 1122 immediately!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      },
      () => alert('Unable to get location. Please enable GPS.')
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Welcome card */}
      <div className="bg-gradient-to-br from-pakistan-green to-pakistan-light rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm">Welcome back,</p>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'provider' ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
                {user?.role === 'provider' ? '🏥 BLS Provider' : '👤 Bystander'}
              </span>
              <span className="text-xs text-green-200">{user?.city}</span>
            </div>
          </div>
          <div className="text-4xl">
            <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12 opacity-80">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-green-100 urdu mt-3">آپ اس نیٹ ورک کا حصہ ہیں جو پاکستانی زندگیاں بچاتا ہے</p>
      </div>

      {/* Provider availability toggle */}
      {user?.role === 'provider' && (
        <div className={`rounded-2xl p-4 border-2 transition-all ${user.is_available ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{user.is_available ? '🟢 You are Available' : '🔴 You are Off Duty'}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {user.is_available ? 'You will receive emergency alerts' : 'You will not receive alerts'}
              </div>
              <div className="urdu text-xs text-gray-500 mt-0.5">
                {user.is_available ? 'آپ ایمرجنسی الرٹ وصول کریں گے' : 'آپ الرٹ وصول نہیں کریں گے'}
              </div>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${user.is_available ? 'bg-pakistan-green' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${user.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/emergency')}
          className="bg-emergency text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span className="font-bold text-sm">Send Alert</span>
          <span className="urdu text-xs opacity-90">ایمرجنسی الرٹ</span>
        </button>

        <button
          onClick={call1122}
          className="bg-pakistan-green text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          <span className="font-bold text-sm">Call 1122</span>
          <span className="urdu text-xs opacity-90">ایمرجنسی کال</span>
        </button>

        <button
          onClick={shareWhatsApp}
          className="bg-[#25D366] text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.528 5.858L.05 23.5l5.793-1.448A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.375l-.36-.214-3.726.931.978-3.605-.234-.371A9.818 9.818 0 1112 21.818z" />
          </svg>
          <span className="font-bold text-sm">Share Location</span>
          <span className="urdu text-xs opacity-90">واٹس ایپ</span>
        </button>

        <button
          onClick={() => navigate('/learn')}
          className="bg-blue-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
          </svg>
          <span className="font-bold text-sm">Learn BLS</span>
          <span className="urdu text-xs opacity-90">سیکھیں</span>
        </button>
      </div>

      {/* Info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex gap-3">
          <div className="text-amber-500 mt-0.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">In an emergency, every second counts</p>
            <p className="text-xs text-amber-700 mt-1">Brain damage begins within 4–6 minutes of cardiac arrest. Early CPR can double survival chances.</p>
            <p className="text-xs text-amber-700 urdu mt-1">فوری سی پی آر سے زندگی بچائی جا سکتی ہے</p>
          </div>
        </div>
      </div>
    </div>
  );
}
