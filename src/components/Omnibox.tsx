// src/components/Omnibox.tsx
import { useState, useRef } from 'react';
import { Search, Command, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TagChip } from './TagChip';
import { removeAccents } from '../utils';
import type { Tag } from '../types';

interface OmniboxProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function Omnibox({ query, onQueryChange, selectedTags, onTagsChange }: OmniboxProps) {
  const { tags } = useStore();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tags based on query, excluding already selected ones
  const filteredTags = tags
    .filter(t => !selectedTags.some(s => s.id === t.id))
    .filter(t => {
      const q = removeAccents(query.toLowerCase());
      return removeAccents(t.name.toLowerCase()).includes(q) || 
             removeAccents(t.category.toLowerCase()).includes(q);
    })
    .slice(0, 5); // show max 5 suggestions

  const handleSelectTag = (tag: Tag) => {
    onTagsChange([...selectedTags, tag]);
    onQueryChange('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && query === '' && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto z-30">
      <div 
        className={`glass flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300 shadow-2xl ${
          isFocused ? 'border-brand-500/50 shadow-brand-500/10' : 'border-white/10'
        }`}
      >
        <div className="pl-3 text-slate-400">
          <Search className="w-5 h-5" />
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-2 overflow-hidden">
          {selectedTags.map(tag => (
            <TagChip key={tag.id} tag={tag} onRemove={() => handleRemoveTag(tag.id)} />
          ))}
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 py-1"
            placeholder={selectedTags.length === 0 ? "Busque por nome, liga, país (ex: Fórmula 1 Brasil)..." : "Adicionar mais filtros..."}
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="pr-3 flex items-center gap-2">
          {query || selectedTags.length > 0 ? (
            <button 
              onClick={() => { onQueryChange(''); onTagsChange([]); }}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-surface-900/50 border border-white/5 text-[10px] text-slate-500 font-medium tracking-widest">
              <Command className="w-3 h-3" /> K
            </div>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isFocused && query && filteredTags.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 glass rounded-2xl border border-white/10 shadow-2xl shadow-black/50 animate-slide-up">
          <p className="text-[10px] uppercase font-semibold text-slate-500 px-3 py-2">Sugerido</p>
          <div className="flex flex-col gap-1">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleSelectTag(tag)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors"
              >
                <TagChip tag={tag} size="sm" />
                <span className="text-xs text-slate-400">Classificar em {tag.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
