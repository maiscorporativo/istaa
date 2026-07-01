// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Tags, Plus, LogOut, Users as UsersIcon
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../store/useAuth';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const { profile, signOut } = useAuth();

  const isSuperadmin = profile?.role === 'superadmin';
  const isEditor = profile?.role === 'editor' || isSuperadmin;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/organizations', icon: Building2, label: 'Parceiros' },
    ...(isEditor ? [{ to: '/tags', icon: Tags, label: 'Descritores / Tags' }] : []),
    ...(isSuperadmin ? [{ to: '/users', icon: UsersIcon, label: 'Usuários e Acessos' }] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shrink-0">
            <span className="text-accent-foreground font-bold text-[11px] tracking-tight">P2P</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight tracking-tight">Guia de Parceiros</p>
            <p className="text-[11px] text-sidebar-foreground/55 leading-tight truncate">Turismo Esportivo Internacional</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      {isEditor && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <NavLink
            to="/organizations/new"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-md bg-accent text-accent-foreground
                       text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Novo Parceiro
          </NavLink>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-3 pb-2">Menu</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        {profile && (
          <div className="mb-2 px-3 py-2.5 rounded-md bg-white/5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-sidebar-foreground font-medium truncate">{profile.email}</p>
              <p className="text-[10px] text-accent uppercase font-bold tracking-wider mt-0.5">{profile.role}</p>
            </div>
            <ThemeToggle />
          </div>
        )}

        <button
          onClick={signOut}
          className="sidebar-link w-full text-left hover:text-destructive"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
