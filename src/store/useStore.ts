import { useState, useCallback, useEffect } from 'react';
import type { Organization, Tag } from '../types';
import { api } from '../lib/api';

interface AppStore {
  organizations: Organization[];
  tags: Tag[];
  loading: boolean;
  addOrganization: (org: Partial<Organization>) => Promise<void>;
  updateOrganization: (id: string, org: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'slug' | 'color'> & { color?: string }) => Promise<Tag | null>;
  refresh: () => Promise<void>;
}

// Global state cache
let _orgs: Organization[] = [];
let _tags: Tag[] = [];
let _loading = true;
let _listeners: Array<() => void> = [];

const notify = () => _listeners.forEach(fn => fn());

async function fetchData() {
  const session = localStorage.getItem('auth_session');
  if (!session) {
    _loading = false;
    notify();
    return;
  }

  _loading = true;
  notify();

  try {
    const [tagsData, orgsData] = await Promise.all([
      api.get('/tags'),
      api.get('/organizations')
    ]);

    _tags = tagsData;
    _orgs = orgsData;
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    _loading = false;
    notify();
  }
}

// Re-fetch data whenever auth state changes (login/logout)
window.addEventListener('auth_state_change', () => {
  const session = localStorage.getItem('auth_session');
  if (session) {
    fetchData();
  } else {
    _orgs = [];
    _tags = [];
    notify();
  }
});

// Initial fetch
fetchData();

export function useStore(): AppStore {
  const [, rerender] = useState(0);

  const subscribe = useCallback(() => {
    const fn = () => rerender(n => n + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  useEffect(() => subscribe(), [subscribe]);

  const addOrganization = async (org: Partial<Organization>) => {
    try {
      await api.post('/organizations', org);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      await api.put(`/organizations/${id}`, updates);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await api.delete(`/organizations/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = async (tag: any): Promise<Tag | null> => {
    try {
      const newTag = await api.post('/tags', tag);
      await fetchData();
      return newTag;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    organizations: _orgs,
    tags: _tags,
    loading: _loading,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addTag,
    refresh: fetchData
  };
}
