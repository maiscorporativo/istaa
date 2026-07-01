// src/pages/Dashboard.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Omnibox } from '../components/Omnibox';
import { StatusBadge } from '../components/StatusBadge';
import { TagChip } from '../components/TagChip';
import { Building2, Globe2, Users, ArrowUpRight, Grid, List, Search, Mail, Phone, User, FilterX, Trophy, Volleyball, CircleDot, Bike, Flag } from 'lucide-react';
import { removeAccents } from '../utils';
import type { Tag } from '../types';

const QUICK_EVENTS = [
  { name: 'Champions League', icon: Trophy },
  { name: 'Libertadores', icon: CircleDot },
  { name: 'Roland Garros', icon: Volleyball },
  { name: 'NBA', icon: Bike },
  { name: 'Fórmula 1', icon: Flag },
];

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
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium text-sm">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Busque entidades esportivas
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm">
          Use a barra abaixo para cruzar dados. Combine modalidades, países e ligas para encontrar as agências parceiras ideais.
        </p>
      </div>

      {/* Quick Event Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {QUICK_EVENTS.map(event => (
          <button
            key={event.name}
            onClick={() => handleEventClick(event.name)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-sm font-medium transition-colors ${
              searchQuery === event.name
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-card text-muted-foreground hover:text-foreground border-border hover:border-accent/40'
            }`}
          >
            <event.icon className="w-3.5 h-3.5" /> {event.name}
          </button>
        ))}
        {searchQuery && (
          <button
            onClick={() => handleEventClick('')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/15 text-sm font-medium transition-colors"
          >
            <FilterX className="w-4 h-4" /> Limpar busca
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
        <div
          onClick={() => { setCardFilter('all'); setSearchQuery(''); setSelectedTags([]); }}
          className={`card flex items-center gap-4 cursor-pointer transition-colors ${
            cardFilter === 'all' && !searchQuery && selectedTags.length === 0 ? 'border-accent/50' : 'hover:border-accent/30'
          }`}
          title="Clique para limpar os filtros e ver todas as entidades"
        >
          <div className="w-11 h-11 rounded-md bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{organizations.length}</p>
            <p className="text-xs text-muted-foreground font-medium">Todas entidades (limpar filtros)</p>
          </div>
        </div>

        <div
          onClick={() => setCardFilter('countries')}
          className={`card flex items-center gap-4 cursor-pointer transition-colors ${
            cardFilter === 'countries' ? 'border-success/50' : 'hover:border-success/30'
          }`}
          title="Clique para ver apenas as entidades que possuem País cadastrado"
        >
          <div className="w-11 h-11 rounded-md bg-success/10 flex items-center justify-center text-success shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {new Set(organizations.map(o => o.country).filter(Boolean)).size}
            </p>
            <p className="text-xs text-muted-foreground font-medium">Países cobertos</p>
          </div>
        </div>

        <div
          onClick={() => setCardFilter('contacts')}
          className={`card flex items-center gap-4 cursor-pointer transition-colors ${
            cardFilter === 'contacts' ? 'border-accent/50' : 'hover:border-accent/30'
          }`}
          title="Clique para ver apenas as entidades que possuem contatos diretos cadastrados"
        >
          <div className="w-11 h-11 rounded-md bg-muted flex items-center justify-center text-foreground shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {organizations.reduce((acc, org) => acc + org.contacts.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground font-medium">Contatos diretos</p>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <h2 className="text-base font-semibold text-foreground">
          Resultados <span className="text-muted-foreground font-normal">({filteredOrgs.length})</span>
        </h2>
        <div className="flex bg-muted p-1 rounded-md border border-border">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'cards' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrgs.map(org => (
            <div key={org.id} onClick={() => navigate(`/organizations/edit/${org.id}`)} className="card card-hover flex flex-col group cursor-pointer relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              <div className="flex items-start gap-3 mb-4 pr-6">
                <img src={org.logo_url} alt={org.name} className="w-11 h-11 rounded-md object-cover border border-border" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground leading-tight truncate">{org.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{org.country}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                {org.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {org.tags.slice(0, 4).map(tag => (
                  <TagChip key={tag.id} tag={tag} size="sm" />
                ))}
                {org.tags.length > 4 && (
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded-md font-medium">
                    +{org.tags.length - 4}
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2 mt-auto">
                <div className="flex items-center justify-between">
                  <StatusBadge status={org.status} />
                  {org.site && (
                    <a href={org.site} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-accent hover:opacity-80 font-medium">
                      Acessar site
                    </a>
                  )}
                </div>
                {org.contacts?.[0] && (
                  <div className="flex flex-col gap-1 pt-1">
                    {org.contacts[0].name && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3 h-3 shrink-0" />
                        {org.contacts[0].name}
                      </span>
                    )}
                    {org.contacts[0].email && (
                      <a href={`mailto:${org.contacts[0].email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-accent hover:opacity-80">
                        <Mail className="w-3 h-3 shrink-0" />
                        {org.contacts[0].email}
                      </a>
                    )}
                    {org.contacts[0].phone && (
                      <a href={`tel:${org.contacts[0].phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
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
        <div className="surface rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Organização</th>
                <th className="px-6 py-3.5">Localização</th>
                <th className="px-6 py-3.5">Descritores principais</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrgs.map(org => (
                <tr key={org.id} onClick={() => navigate(`/organizations/edit/${org.id}`)} className="hover:bg-muted/60 transition-colors cursor-pointer">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={org.logo_url} className="w-8 h-8 rounded object-cover border border-border" />
                      <span className="font-medium text-foreground">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{org.country || '-'}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {org.tags.slice(0, 3).map(tag => (
                        <TagChip key={tag.id} tag={tag} size="sm" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
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
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">Nenhum resultado encontrado</p>
          <p className="text-muted-foreground text-sm mt-1">Tente remover alguns filtros ou buscar por outros termos.</p>
        </div>
      )}
    </div>
  );
}
