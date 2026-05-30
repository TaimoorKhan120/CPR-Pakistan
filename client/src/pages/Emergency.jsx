import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import EmergencyMap from '../components/EmergencyMap';
import Chat from '../components/Chat';

export default function Emergency() {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [state, setState] = useState('idle'); // idle | locating | sending | pending | accepted | completed
  const [error, setError] = useState('');
  const [myLocation, setMyLocation] = useState(null);
  const [request, setRequest] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const locationWatchRef = useRef(null);
  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  // Check for existing active request on mount
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await fetch('/api/emergency/my-request', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.status === 'pending') {
          setRequest(data);
          setMyLocation({ lat: data.requester_lat, lng: data.requester_lng });
          setState('pending');
        } else if (data && data.status === 'accepted') {
          setRequest(data);
          setMyLocation({ lat: data.requester_lat, lng: data.requester_lng });
          if (data.provider_lat && data.provider_lng) {
            setProviderLocation({ lat: data.provider_lat, lng: data.provider_lng });
          }
          setState('accepted');
        }
      } catch {}
    };
    checkExisting();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const onAccepted = ({ provider, requestId, eta: e }) => {
      setRequest((prev) => prev ? { ...prev, status: 'accepted', provider_name: provider.name, provider_phone: provider.phone } : prev);
      if (e) setEta(e);
      setState('accepted');
    };

    const onProviderLocation = ({ lat, lng, eta: e }) => {
      setProviderLocation({ lat, lng });
      if (e) setEta(e);
    };

    const onNotified = ({ count }) => setNotifiedCount(count);

    const onCancelled = () => {
      setState('idle');
      setRequest(null);
      setProviderLocation(null);
      setEta(null);
    };

    socket.on('request_accepted', onAccepted);
    socket.on('provider_location', onProviderLocation);
    socket.on('providers_notified', onNotified);
    socket.on('request_cancelled', onCancelled);

    return () => {
      socket.off('request_accepted', onAccepted);
      socket.off('provider_location', onProviderLocation);
      socket.off('providers_notified', onNotified);
      socket.off('request_cancelled', onCancelled);
    };
  }, [socket]);

  const startLocationWatch = () => {
    if (locationWatchRef.current) return;
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
        socketRef.current?.emit('update_location', loc);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const [locationDenied, setLocationDenied] = useState(false);

  // Check permission state on mount
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') setLocationDenied(true);
      result.onchange = () => setLocationDenied(result.state === 'denied');
    });
  }, []);

  useEffect(() => {
    return () => {
      if (locationWatchRef.current) navigator.geolocation.clearWatch(locationWatchRef.current);
    };
  }, []);

  const sendAlert = async () => {
    setError('');
    setLocationDenied(false);
    setState('locating');
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setMyLocation({ lat, lng });
      setState('sending');
      socketRef.current?.emit('update_location', { lat, lng });
      startLocationWatch();

      const res = await fetch('/api/emergency/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requestId) { setRequest({ id: data.requestId }); setState('pending'); return; }
        setError(data.error || 'Failed to send alert');
        setState('idle');
        return;
      }

      setRequest(data.request);
      setNotifiedCount(data.notifiedCount);
      setState('pending');
      socketRef.current?.emit('emergency_request', { requestId: data.request.id });
    } catch (err) {
      setState('idle');
      if (err.code === 1) {
        setLocationDenied(true);
      } else {
        setError('Could not get location. Please try again.');
      }
    }
  };

  const cancelRequest = async () => {
    if (!request) { setState('idle'); return; }
    try {
      await fetch(`/api/emergency/request/${request.id}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      socketRef.current?.emit('request_cancelled', { requestId: request.id });
      if (locationWatchRef.current) { navigator.geolocation.clearWatch(locationWatchRef.current); locationWatchRef.current = null; }
    } finally {
      setState('idle'); setRequest(null); setProviderLocation(null); setEta(null); setNotifiedCount(0);
    }
  };

  const markComplete = async () => {
    if (!request) return;
    await fetch(`/api/emergency/request/${request.id}/complete`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (locationWatchRef.current) { navigator.geolocation.clearWatch(locationWatchRef.current); locationWatchRef.current = null; }
    setState('completed'); setRequest(null); setProviderLocation(null); setEta(null);
  };

  if (state === 'completed') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="#16a34a" className="w-10 h-10"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Emergency Resolved</h2>
        <p className="text-gray-500 mt-2">Thank you for using CPR Pakistan</p>
        <p className="urdu text-gray-500 mt-1">شکریہ</p>
        <button onClick={() => setState('idle')} className="mt-6 bg-pakistan-green text-white px-6 py-3 rounded-xl font-semibold">Back to Home</button>
      </div>
    );
  }

  if (locationDenied) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-center">
          <div className="text-5xl mb-3">📍</div>
          <h2 className="text-lg font-bold text-red-700">Location Access Blocked</h2>
          <p className="urdu text-red-600 text-sm mt-1">لوکیشن کی اجازت بند ہے</p>
          <p className="text-sm text-gray-600 mt-3">
            CPR Pakistan needs your location to send alerts to nearby responders. Your browser has blocked it.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-sm text-gray-800">How to fix it:</h3>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 bg-pakistan-green text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p>Click the <strong>🔒 lock icon</strong> in your browser's address bar (next to <code className="bg-gray-100 px-1 rounded">localhost:4000</code>)</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 bg-pakistan-green text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p>Find <strong>Location</strong> and change it from <strong>Block</strong> to <strong>Allow</strong></p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 bg-pakistan-green text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p>Reload the page and tap Send Alert again</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
            <p className="text-xs text-amber-700 font-medium">Safari users:</p>
            <p className="text-xs text-amber-600 mt-0.5">Safari menu → Settings for This Website → Location → Allow</p>
          </div>
        </div>

        <button
          onClick={() => { setLocationDenied(false); window.location.reload(); }}
          className="w-full bg-pakistan-green text-white py-3 rounded-xl font-semibold"
        >
          I've enabled location — Reload
        </button>

        <div className="grid grid-cols-2 gap-3">
          <a href="tel:1122" className="bg-emergency text-white rounded-xl p-3 flex items-center justify-center gap-2 font-bold text-sm">
            📞 Call 1122
          </a>
          <button
            onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent('🚨 EMERGENCY! Please help!'), '_blank')}
            className="bg-[#25D366] text-white rounded-xl p-3 flex items-center justify-center gap-2 font-bold text-sm"
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Map */}
      <div className="h-64">
        <EmergencyMap myLocation={myLocation} providerLocation={state === 'accepted' ? providerLocation : null} />
      </div>

      <div className="p-4 space-y-4">
        {/* Pending status */}
        {state === 'pending' && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center animate-pulse">
            <div className="text-amber-600 font-bold text-sm">🔍 Searching for BLS Providers...</div>
            <div className="urdu text-amber-600 text-xs mt-1">قریبی امدادگار ڈھونڈے جا رہے ہیں</div>
            {notifiedCount > 0 && (
              <div className="text-xs text-amber-700 mt-2 font-medium">{notifiedCount} provider{notifiedCount > 1 ? 's' : ''} notified</div>
            )}
          </div>
        )}

        {/* Accepted status with ETA */}
        {state === 'accepted' && request && (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <span className="text-green-700 font-bold text-sm">Responder On the Way!</span>
            </div>
            <div className="urdu text-green-700 text-xs mb-3">امدادگار آ رہا ہے</div>

            {eta && (
              <div className="bg-white rounded-xl p-3 mb-3 flex items-center gap-3 border border-green-200">
                <div className="text-3xl">🚗</div>
                <div>
                  <div className="text-2xl font-black text-pakistan-green">{eta} min</div>
                  <div className="text-xs text-gray-500">Estimated arrival time</div>
                  <div className="urdu text-xs text-gray-500">متوقع آمد کا وقت</div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-3 border border-green-200">
              <div className="text-sm font-semibold text-gray-800">{request.provider_name}</div>
              <div className="text-xs text-gray-500 mt-0.5">BLS Provider — En Route</div>
              <div className="flex gap-2 mt-2">
                {request.provider_phone && (
                  <a href={`tel:${request.provider_phone}`} className="flex items-center gap-1 text-pakistan-green text-xs font-medium bg-green-50 px-2 py-1 rounded-lg">
                    📞 Call
                  </a>
                )}
                {request.provider_phone && (
                  <a href={`https://wa.me/${request.provider_phone?.replace(/^0/, '92')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#25D366] text-xs font-medium bg-green-50 px-2 py-1 rounded-lg">
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Main SOS button */}
        {state === 'idle' && (
          <div className="flex flex-col items-center py-4">
            <button onClick={sendAlert} className="emergency-btn">
              <div className="text-center">
                <div className="text-4xl mb-1">🆘</div>
                <div className="font-black text-lg leading-tight">SEND</div>
                <div className="font-black text-lg leading-tight">ALERT</div>
                <div className="urdu text-sm mt-1 font-normal">مدد بھیجیں</div>
              </div>
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">
              Tap to broadcast to all nearby BLS providers within their response radius
            </p>
          </div>
        )}

        {(state === 'locating' || state === 'sending') && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin w-16 h-16 border-4 border-emergency border-t-transparent rounded-full" />
            <p className="mt-4 font-semibold text-gray-700">
              {state === 'locating' ? 'Getting your location...' : 'Sending emergency alert...'}
            </p>
            <p className="urdu text-gray-500 text-sm mt-1">
              {state === 'locating' ? 'آپ کی لوکیشن لی جا رہی ہے' : 'الرٹ بھیجا جا رہا ہے'}
            </p>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:1122" className="bg-pakistan-green text-white rounded-xl p-3 flex items-center gap-2 font-semibold text-sm">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 shrink-0"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
            <div><div>Call 1122</div><div className="urdu text-xs font-normal opacity-80">فوری کال</div></div>
          </a>
          <button
            onClick={() => {
              const loc = myLocation;
              if (!loc) { navigator.geolocation.getCurrentPosition((p) => { const msg = `🚨 EMERGENCY!\nhttps://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'); }); return; }
              const msg = `🚨 EMERGENCY!\nhttps://maps.google.com/?q=${loc.lat},${loc.lng}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            className="bg-[#25D366] text-white rounded-xl p-3 flex items-center gap-2 font-semibold text-sm"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 shrink-0"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.528 5.858L.05 23.5l5.793-1.448A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.894 16.853c-.246.692-1.448 1.326-2.017 1.411-.515.077-1.165.11-1.879-.118-.432-.136-.984-.318-1.694-.625-2.981-1.287-5.077-4.29-5.077-4.487-.149-.199-1.213-1.612-1.213-3.074 0-1.463.77-2.182 1.04-2.479.272-.298.594-.372.792-.372.198 0 .397.002.57.01.182.01.427-.07.669.51.247.595.841 2.058.916 2.207.075.149.124.323.025.52-.1.2-.149.323-.298.498-.149.173-.313.387-.447.52-.148.148-.303.31-.13.607.173.298.77 1.271 1.653 2.059 1.135 1.012 2.093 1.325 2.39 1.475.297.148.471.124.644-.075.173-.198.743-.867.94-1.164.198-.298.396-.249.669-.15.272.1 1.733.818 2.03.967.298.149.496.223.57.347.075.124.075.719-.173 1.413z" /></svg>
            <div><div>WhatsApp</div><div className="urdu text-xs font-normal opacity-80">لوکیشن شیئر</div></div>
          </button>
        </div>

        {/* Cancel / Complete */}
        {(state === 'pending' || state === 'accepted') && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {state === 'accepted' && (
              <button onClick={markComplete} className="bg-pakistan-green text-white rounded-xl py-3 font-semibold text-sm">✅ Mark Complete</button>
            )}
            <button onClick={cancelRequest} className={`${state === 'accepted' ? '' : 'col-span-2'} bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold text-sm border border-gray-200`}>
              Cancel Request
            </button>
          </div>
        )}
      </div>

      {/* Floating chat — only when accepted */}
      {state === 'accepted' && request?.id && (
        <Chat
          requestId={request.id}
          otherName={request.provider_name}
          otherPhone={request.provider_phone}
        />
      )}
    </div>
  );
}
