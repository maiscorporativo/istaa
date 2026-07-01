import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';

export type UserRole = 'superadmin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Global state cache
let _user: User | null = null;
let _profile: Profile | null = null;
let _loading = true;
let _listeners: Array<() => void> = [];

const notify = () => _listeners.forEach(fn => fn());

async function fetchProfile() {
  try {
    const profile = await api.get('/auth/profile');
    _profile = profile;
    _user = { id: profile.id, email: profile.email, role: profile.role };
  } catch (err) {
    _user = null;
    _profile = null;
    localStorage.removeItem('auth_session');
  }
}

async function initializeAuth() {
  _loading = true;
  notify();

  const sessionStr = localStorage.getItem('auth_session');
  if (sessionStr) {
    await fetchProfile();
  } else {
    _user = null;
    _profile = null;
  }

  _loading = false;
  notify();
}

// Initialize on load
initializeAuth();

export function useAuth(): AuthStore {
  const [, rerender] = useState(0);

  const subscribe = useCallback(() => {
    const fn = () => rerender(n => n + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  useEffect(() => subscribe(), [subscribe]);

  const signIn = async (email: string, password: string) => {
    _loading = true;
    notify();
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('auth_session', JSON.stringify(data.session));
      _user = data.session.user;
      await fetchProfile();
      _loading = false;
      notify();
      window.dispatchEvent(new Event('auth_state_change'));
      return { error: null };
    } catch (error: any) {
      _loading = false;
      notify();
      return { error };
    }
  };

  const signUp = async (_email: string, _password: string) => {
    // Signup is not exposed in the API to prevent public registration in this CMS.
    // Must be added manually or by a superadmin endpoint if needed later.
    return { error: new Error('Registro desabilitado. Contate o administrador.') };
  };

  const signOut = async () => {
    _loading = true;
    notify();
    localStorage.removeItem('auth_session');
    _user = null;
    _profile = null;
    _loading = false;
    notify();
    // Dispatch custom event so useStore can clear data
    window.dispatchEvent(new Event('auth_state_change'));
  };

  const refreshProfile = async () => {
    if (_user) {
      await fetchProfile();
      notify();
    }
  };

  return {
    user: _user,
    profile: _profile,
    loading: _loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };
}
