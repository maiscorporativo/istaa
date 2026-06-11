// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Tags, Search, Plus, Settings, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/organizations', icon: Building2, label: 'Organizações' },
  { to: '/tags', icon: Tags, label: 'Descritores / Tags' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 glass border-r border-white/5 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Search className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 tracking-tight">ISTAA</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Turismo Esportivo</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-3 py-3 border-b border-white/5">
        <NavLink
          to="/organizations/new"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-brand-600/90 hover:bg-brand-600 
                     text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          Nova Organização
        </NavLink>
      </div>

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
        <NavLink
          to="/settings"
          className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Configurações
        </NavLink>
        <div className="mt-3 px-3 py-2 rounded-xl bg-surface-900/60 border border-white/5">
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Dados salvos localmente.<br />
            Conecte ao Supabase para persistência.
          </p>
        </div>
      </div>
    </aside>
  );
}
