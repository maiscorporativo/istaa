// src/store/useStore.ts
import { useState, useCallback, createContext, useContext } from 'react';
import type { Organization, Tag } from '../types';
import { MOCK_ORGANIZATIONS, MOCK_TAGS } from '../data/mockData';

interface AppStore {
  organizations: Organization[];
  tags: Tag[];
  addOrganization: (org: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => void;
  updateOrganization: (id: string, org: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => Tag;
}

// We export a simple context-less hook that uses module-level state for the mock
// This will be replaced by Supabase calls in Phase 2

let _orgs: Organization[] = [...MOCK_ORGANIZATIONS];
let _tags: Tag[] = [...MOCK_TAGS];
let _listeners: Array<() => void> = [];

const notify = () => _listeners.forEach(fn => fn());

export function useStore(): AppStore {
  const [, rerender] = useState(0);

  const subscribe = useCallback(() => {
    const fn = () => rerender(n => n + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  // Auto-subscribe on first render
  useState(() => subscribe());

  const addOrganization = useCallback((org: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newOrg: Organization = {
      ...org,
      id: `org_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    _orgs = [newOrg, ..._orgs];
    notify();
  }, []);

  const updateOrganization = useCallback((id: string, updates: Partial<Organization>) => {
    _orgs = _orgs.map(o => o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o);
    notify();
  }, []);

  const deleteOrganization = useCallback((id: string) => {
    _orgs = _orgs.filter(o => o.id !== id);
    notify();
  }, []);

  const addTag = useCallback((tag: Omit<Tag, 'id'>): Tag => {
    const newTag: Tag = { ...tag, id: `tag_${Date.now()}` };
    _tags = [..._tags, newTag];
    notify();
    return newTag;
  }, []);

  return {
    organizations: _orgs,
    tags: _tags,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addTag,
  };
}
