// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Tags, Search, Plus, ChevronRight, LogOut, Users as UsersIcon
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../store/useAuth';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  
  const isSuperadmin = profile?.role === 'superadmin';
  const isEditor = profile?.role === 'editor' || isSuperadmin;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/organizations', icon: Building2, label: 'Parceiros' },
    // Apenas quem pode editar vê as Tags
    ...(isEditor ? [{ to: '/tags', icon: Tags, label: 'Descritores / Tags' }] : []),
    ...(isSuperadmin ? [{ to: '/users', icon: UsersIcon, label: 'Gerenciar Usuários' }] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 glass border-r border-white/5 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Search className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100 leading-tight">Guia de Parceiros de Turismo Esportivo - (Internacional)</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      {isEditor && (
        <div className="px-3 py-3 border-b border-white/5">
          <NavLink
            to="/organizations/new"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-brand-600/90 hover:bg-brand-600 
                       text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            Novo Parceiro
          </NavLink>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pb-1.5">Menu</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'sidebar-link',
                isActive && 'active'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/5">
        {profile && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-surface-900/60 border border-white/5 flex flex-col">
            <span className="text-xs text-slate-300 font-medium truncate">{profile.email}</span>
            <span className="text-[10px] text-brand-400 uppercase font-bold tracking-wider mt-0.5">Perfil: {profile.role}</span>
          </div>
        )}
        
        <button
          onClick={signOut}
          className="sidebar-link w-full text-left flex items-center gap-2 text-slate-400 hover:text-red-400"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
