import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import EmergencyMap from '../components/EmergencyMap';

export default function ProviderDashboard() {
  const { user, token, updateUser } = useAuth();
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [toggling, setToggling] = useState(false);
  const locationWatchRef = useRef(null);
  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  useEffect(() => {
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
    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNewEmergency = (alert) => {
      setAlerts((prev) => {
        if (prev.find((a) => a.id === alert.id)) return prev;
        return [alert, ...prev].slice(0, 10);
      });
    };

    const onCancelled = ({ requestId }) => {
      setAlerts((prev) => prev.filter((a) => a.id !== requestId));
      if (activeRequest?.id === requestId) setActiveRequest(null);
    };

    socket.on('new_emergency', onNewEmergency);
    socket.on('request_cancelled', onCancelled);

    return () => {
      socket.off('new_emergency', onNewEmergency);
      socket.off('request_cancelled', onCancelled);
    };
  }, [socket, activeRequest]);

  const toggleAvailability = async () => {
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

  const acceptAlert = async (alert) => {
    try {
      if (socketRef.current) {
        socketRef.current.emit('accept_request', { requestId: alert.id });
      } else {
        const res = await fetch(`/api/emergency/request/${alert.id}/accept`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
      }
      setActiveRequest(alert);
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    } catch {
      // ignore
    }
  };

  const declineAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const completeRequest = async () => {
    if (!activeRequest) return;
    await fetch(`/api/emergency/request/${activeRequest.id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setActiveRequest(null);
  };

  const openMaps = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  if (user?.role !== 'provider') {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">This section is for registered BLS Providers only.</p>
        <p className="urdu text-gray-500 mt-2">یہ سیکشن صرف تربیت یافتہ امدادگاروں کے لیے ہے</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Status toggle */}
      <div className={`rounded-2xl p-4 border-2 ${user.is_available ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{user.is_available ? '🟢 Available for Emergencies' : '🔴 Off Duty'}</div>
            <div className="urdu text-xs text-gray-500 mt-1">
              {user.is_available ? 'آپ الرٹ وصول کر رہے ہیں' : 'الرٹ بند ہیں'}
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${user.is_available ? 'bg-pakistan-green' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${user.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {myLocation && (
          <p className="text-xs text-gray-500 mt-2">📍 Location active — sharing with network</p>
        )}
      </div>

      {/* Active request */}
      {activeRequest && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl overflow-hidden">
          <div className="bg-green-500 text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            Active Emergency — En Route
          </div>
          <div className="h-48">
            <EmergencyMap
              myLocation={myLocation}
              providerLocation={{ lat: activeRequest.requester_lat, lng: activeRequest.requester_lng }}
            />
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-sm font-semibold">Patient: {activeRequest.requester_name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Distance: ~{activeRequest.distance} km away
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openMaps(activeRequest.requester_lat, activeRequest.requester_lng)}
                className="bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                🗺️ Navigate
              </button>
              <button
                onClick={completeRequest}
                className="bg-pakistan-green text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                ✅ Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming alerts */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>Incoming Alerts</span>
          {alerts.length > 0 && (
            <span className="bg-emergency text-white text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
          )}
        </h3>

        {alerts.length === 0 && !activeRequest && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-5xl mb-3">📡</div>
            <p className="text-sm font-medium">No active alerts</p>
            <p className="urdu text-xs mt-1">کوئی الرٹ نہیں</p>
            {!user.is_available && (
              <p className="text-xs text-amber-600 mt-3">Turn on availability to receive alerts</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-red-700 text-sm flex items-center gap-1">
                    <span>🚨</span>
                    <span>Emergency Alert!</span>
                  </div>
                  <div className="urdu text-red-600 text-xs mt-0.5">ایمرجنسی الرٹ</div>
                  <div className="text-xs text-gray-600 mt-1">
                    From: {alert.requester_name} • ~{alert.distance} km away
                  </div>
                </div>
                <button
                  onClick={() => openMaps(alert.requester_lat, alert.requester_lng)}
                  className="text-blue-600 text-xs underline"
                >
                  View Map
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => acceptAlert(alert)}
                  className="bg-pakistan-green text-white rounded-xl py-2.5 text-sm font-bold"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => declineAlert(alert.id)}
                  className="bg-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
