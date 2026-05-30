import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

function requestLocationPermission() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const watchRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((u) => {
          setUser(u);
          setLoading(false);
          if (u) startBackgroundWatch();
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => stopBackgroundWatch();
  }, [token]);

  const startBackgroundWatch = () => {
    if (watchRef.current || !navigator.geolocation) return;
    // Request permission immediately and silently keep watching
    watchRef.current = navigator.geolocation.watchPosition(
      () => {}, // location handled per-page via socket
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const stopBackgroundWatch = () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const login = (tokenVal, userData) => {
    localStorage.setItem('token', tokenVal);
    setToken(tokenVal);
    setUser(userData);
    requestLocationPermission(); // prompt immediately after login
    startBackgroundWatch();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    stopBackgroundWatch();
  };

  const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
