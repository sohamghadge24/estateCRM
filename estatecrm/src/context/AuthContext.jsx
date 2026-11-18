import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('propnexa_user');
      return stored ? JSON.parse(stored) : {
        email: 'alexander@apexhorizon.com',
        fullName: 'Alexander Wright',
        role: 'AGENCY_ADMIN',
        agencyName: 'Apex Horizon Capital',
      };
    } catch {
      return {
        email: 'alexander@apexhorizon.com',
        fullName: 'Alexander Wright',
        role: 'AGENCY_ADMIN',
        agencyName: 'Apex Horizon Capital',
      };
    }
  });

  const [activeTenant, setActiveTenant] = useState(() => {
    try {
      const storedTenantId = localStorage.getItem('propnexa_tenant_id');
      const validTenantId = storedTenantId && storedTenantId !== '1' ? storedTenantId : 't_apex_01';
      return {
        id: validTenantId,
        name: 'Apex Horizon Capital',
        subdomain: 'apexhorizon.estatecrm.com',
        plan: 'ENTERPRISE',
      };
    } catch {
      return {
        id: 't_apex_01',
        name: 'Apex Horizon Capital',
        subdomain: 'apexhorizon.estatecrm.com',
        plan: 'ENTERPRISE',
      };
    }
  });

  const [currency, setCurrency] = useState('INR'); // INR, AED, GBP, USD

  // Sync session with backend /auth/me on mount or auto-login dev admin
  useEffect(() => {
    const checkSession = async () => {
      let token = localStorage.getItem('propnexa_auth_token');
      if (!token) {
        try {
          await login('admin@estatecrm.com', 'Password123!');
          return;
        } catch (e) {
          console.warn('Initial dev auth attempt:', e.message);
        }
      }
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setUser({
              id: res.user.id,
              email: res.user.email,
              fullName: res.user.full_name || res.user.fullName,
              role: res.user.role,
              agencyName: res.active_tenant?.name || 'Apex Horizon Capital',
              avatarUrl: res.user.avatar_url,
            });
            if (res.active_tenant) {
              setActiveTenant(res.active_tenant);
            }
          }
        } catch (e) {
          console.warn('Session verification note:', e.message);
          // If token was rejected, attempt fresh login
          try {
            await login('admin@estatecrm.com', 'Password123!');
          } catch {}
        }
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('propnexa_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('propnexa_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res?.user) {
      setUser({
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name || res.user.fullName,
        role: res.user.role,
        agencyName: res.user.agency_name || 'Apex Horizon Capital',
      });
      if (res.tenant_id) {
        setActiveTenant((prev) => ({
          ...prev,
          id: res.tenant_id,
          name: res.user.agency_name || prev.name,
        }));
      }
      return true;
    }
    return false;
  };

  const register = async (registrationData) => {
    const res = await api.register(registrationData);
    if (res?.user) {
      setUser({
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.full_name || res.user.fullName,
        role: res.user.role,
        agencyName: res.user.agency_name || registrationData.agency_name,
      });
      return true;
    }
    return false;
  };

  const logout = async () => {
    api.logAudit('USER_LOGOUT', user?.email || 'Unknown', 'AUTH');
    await api.logout();
    setUser(null);
  };

  // Helper to format currency values based on current active market
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    if (currency === 'INR') {
      if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakhs`;
      return `₹ ${num.toLocaleString('en-IN')}`;
    }
    if (currency === 'AED') {
      if (num >= 1000000) return `AED ${(num / 1000000).toFixed(2)}M`;
      return `AED ${num.toLocaleString()}`;
    }
    if (currency === 'GBP') {
      if (num >= 1000000) return `£ ${(num / 1000000).toFixed(2)}M`;
      return `£ ${num.toLocaleString()}`;
    }
    if (num >= 1000000) return `$ ${(num / 1000000).toFixed(2)}M`;
    return `$ ${num.toLocaleString()}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      activeTenant,
      setActiveTenant,
      currency,
      setCurrency,
      formatCurrency,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
