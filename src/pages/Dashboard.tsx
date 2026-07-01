// src/pages/Dashboard.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Omnibox } from '../components/Omnibox';
import { StatusBadge } from '../components/StatusBadge';
import { TagChip } from '../components/TagChip';
import { Building2, Globe2, Users, ArrowUpRight, Grid, List, Search, Mail, Phone, User, FilterX } from 'lucide-react';
import { removeAccents } from '../utils';
import type { Tag } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const { organizations, loading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [cardFilter, setCardFilter] = useState<'all' | 'countries' | 'contacts'>('all');

  const filteredOrgs = useMemo(() => {
    let result = organizations;

    // Filter by Metric Cards
    if (cardFilter === 'countries') {
      result = result.filter(org => org.country && org.country.trim() !== '');
    } else if (cardFilter === 'contacts') {
      result = result.filter(org => org.contacts && org.contacts.length > 0);
    }

    // Filter by tags (AND logic: must have all selected tags)
    if (selectedTags.length > 0) {
      result = result.filter(org => 
        selectedTags.every(tag => org.tags.some(t => t.id === tag.id))
      );
    }

    // Filter by text query
    if (searchQuery) {
      const lowerQ = removeAccents(searchQuery.toLowerCase());
      result = result.filter(org => {
        const nameMatch = removeAccents(org.name.toLowerCase()).includes(lowerQ);
        const countryMatch = org.country ? removeAccents(org.country.toLowerCase()).includes(lowerQ) : false;
        const descMatch = org.description ? removeAccents(org.description.toLowerCase()).includes(lowerQ) : false;
        return nameMatch || countryMatch || descMatch;
      });
    }

    return result;
  }, [organizations, searchQuery, selectedTags, cardFilter]);



  const handleEventClick = (eventName: string) => {
    setSearchQuery(eventName);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-medium border border-brand-500/20">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Sistema Inteligente de Recuperação
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Busque Entidades Esportivas
        </h1>
        <p className="text-slate-400 max-w-xl text-sm">
          Use a barra inteligente abaixo para cruzar dados. Experimente misturar modalidades, países e ligas para encontrar as agências perfeitas.
        </p>
      </div>

      {/* Quick Event Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {[
          { name: 'Champions League', icon: '🏆' },
          { name: 'Libertadores', icon: '⚽' },
          { name: 'Roland Garros', icon: '🎾' },
          { name: 'NBA', icon: '🏀' },
          { name: 'Fórmula 1', icon: '🏁' },
        ].map(event => (
          <button
            key={event.name}
            onClick={() => handleEventClick(event.name)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              searchQuery === event.name 
                ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20' 
                : 'bg-surface-800/50 text-slate-300 hover:bg-white/10 border-white/5'
            }`}
          >
            {event.icon} {event.name}
          </button>
        ))}
        {searchQuery && (
          <button
            onClick={() => handleEventClick('')}
            className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-all flex items-center gap-1"
          >
            <FilterX className="w-4 h-4" /> Limpar Busca
          </button>
        )}
      </div>

      {/* Omnibox */}
      <Omnibox 
        query={searchQuery}
        onQueryChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />

      {/* Stats row as Interactive Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* All Entities Card / Clear Card Filter */}
        <div 
          onClick={() => { setCardFilter('all'); setSearchQuery(''); setSelectedTags([]); }}
          className={`card flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] ${
            cardFilter === 'all' && !searchQuery && selectedTags.length === 0 ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : 'hover:bg-white/5'
          }`}
          title="Clique para limpar os filtros e ver todas as entidades"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{organizations.length}</p>
            <p className="text-xs text-slate-400 font-medium">Todas Entidades (Limpar Filtros)</p>
          </div>
        </div>

        {/* Countries Card */}
        <div 
          onClick={() => setCardFilter('countries')}
          className={`card flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] ${
            cardFilter === 'countries' ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : 'hover:bg-white/5'
          }`}
          title="Clique para ver apenas as entidades que possuem País cadastrado"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {new Set(organizations.map(o => o.country).filter(Boolean)).size}
            </p>
            <p className="text-xs text-slate-400 font-medium">Filtrar por Países Cobertos</p>
          </div>
        </div>

        {/* Contacts Card */}
        <div 
          onClick={() => setCardFilter('contacts')}
          className={`card flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] ${
            cardFilter === 'contacts' ? 'ring-2 ring-purple-500/50 bg-purple-500/5' : 'hover:bg-white/5'
          }`}
          title="Clique para ver apenas as entidades que possuem contatos diretos cadastrados"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {organizations.reduce((acc, org) => acc + org.contacts.length, 0)}
            </p>
            <p className="text-xs text-slate-400 font-medium">Filtrar por Contatos Diretos</p>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-8 border-t border-white/5">
        <h2 className="text-lg font-semibold text-white">
          Resultados ({filteredOrgs.length})
        </h2>
        <div className="flex bg-surface-900/50 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-surface-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map(org => (
            <div key={org.id} onClick={() => navigate(`/organizations/edit/${org.id}`)} className="card card-hover flex flex-col group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 backdrop-blur-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <img src={org.logo_url} alt={org.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10" />
                <div>
                  <h3 className="font-bold text-slate-100 leading-tight">{org.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{org.country}</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                {org.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {org.tags.slice(0, 4).map(tag => (
                  <TagChip key={tag.id} tag={tag} size="sm" />
                ))}
                {org.tags.length > 4 && (
                  <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-white/5 rounded-full border border-white/5 font-medium">
                    +{org.tags.length - 4}
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col gap-2 mt-auto">
                <div className="flex items-center justify-between">
                  <StatusBadge status={org.status} />
                  {org.site && (
                    <a href={org.site} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                      Acessar site
                    </a>
                  )}
                </div>
                {org.contacts?.[0] && (
                  <div className="flex flex-col gap-1 pt-1">
                    {org.contacts[0].name && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        {org.contacts[0].name}
                      </span>
                    )}
                    {org.contacts[0].email && (
                      <a href={`mailto:${org.contacts[0].email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300">
                        <Mail className="w-3 h-3 shrink-0" />
                        {org.contacts[0].email}
                      </a>
                    )}
                    {org.contacts[0].phone && (
                      <a href={`tel:${org.contacts[0].phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300">
                        <Phone className="w-3 h-3 shrink-0" />
                        {org.contacts[0].phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Organização</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Descritores Principais</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrgs.map(org => (
                <tr key={org.id} onClick={() => navigate(`/organizations/edit/${org.id}`)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={org.logo_url} className="w-8 h-8 rounded-lg" />
                      <span className="font-medium text-slate-200">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{org.country || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {org.tags.slice(0, 3).map(tag => (
                        <TagChip key={tag.id} tag={tag} size="sm" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={org.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredOrgs.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-3xl bg-surface-800 flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Search className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-300 font-medium">Nenhum resultado encontrado</p>
          <p className="text-slate-500 text-sm mt-1">Tente remover alguns filtros ou buscar por outros termos.</p>
        </div>
      )}
    </div>
  );
}
