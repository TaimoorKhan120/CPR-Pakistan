import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makeMyIcon = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#DC2626;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const makeProviderIcon = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:24px;height:24px;background:#006400;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px">🏥</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

export default function EmergencyMap({ myLocation, providerLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const providerMarkerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const defaultCenter = myLocation ? [myLocation.lat, myLocation.lng] : [30.3753, 69.3451];
    mapRef.current = L.map(containerRef.current, { zoomControl: true, attributionControl: false })
      .setView(defaultCenter, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      myMarkerRef.current = null;
      providerMarkerRef.current = null;
    };
  }, []);

  // Update my location marker
  useEffect(() => {
    if (!mapRef.current || !myLocation) return;
    if (!myMarkerRef.current) {
      myMarkerRef.current = L.marker([myLocation.lat, myLocation.lng], { icon: makeMyIcon() })
        .addTo(mapRef.current)
        .bindPopup('Emergency Location');
      mapRef.current.setView([myLocation.lat, myLocation.lng], 15);
    } else {
      myMarkerRef.current.setLatLng([myLocation.lat, myLocation.lng]);
    }
  }, [myLocation]);

  // Update provider location marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (!providerLocation) {
      providerMarkerRef.current?.remove();
      providerMarkerRef.current = null;
      return;
    }
    if (!providerMarkerRef.current) {
      providerMarkerRef.current = L.marker([providerLocation.lat, providerLocation.lng], { icon: makeProviderIcon() })
        .addTo(mapRef.current)
        .bindPopup('BLS Responder');
    } else {
      providerMarkerRef.current.setLatLng([providerLocation.lat, providerLocation.lng]);
    }
    if (myLocation) {
      mapRef.current.fitBounds(
        L.latLngBounds([myLocation.lat, myLocation.lng], [providerLocation.lat, providerLocation.lng]),
        { padding: [40, 40] }
      );
    }
  }, [providerLocation]);

  return (
    <div className="w-full h-full bg-gray-100 relative">
      {!myLocation && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80 pointer-events-none">
          <div className="text-center">
            <div className="text-3xl mb-2">📍</div>
            <p className="text-sm text-gray-600">Map loads with your location</p>
            <p className="urdu text-xs text-gray-500">لوکیشن دستیاب ہونے پر نقشہ</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
