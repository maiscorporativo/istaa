// src/components/Omnibox.tsx
import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
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
    <div className="relative w-full max-w-2xl mx-auto z-30">
      <div
        className={`surface flex items-center gap-2 p-2 rounded-lg border transition-colors duration-150 ${
          isFocused ? 'border-ring/60 ring-2 ring-ring/20' : 'border-border'
        }`}
      >
        <div className="pl-2.5 text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-1.5 overflow-hidden">
          {selectedTags.map(tag => (
            <TagChip key={tag.id} tag={tag} onRemove={() => handleRemoveTag(tag.id)} />
          ))}

          <input
            ref={inputRef}
            type="text"
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground py-1"
            placeholder={selectedTags.length === 0 ? "Busque por nome, liga, país (ex: Fórmula 1 Brasil)..." : "Adicionar mais filtros..."}
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="pr-2">
          {(query || selectedTags.length > 0) && (
            <button
              onClick={() => { onQueryChange(''); onTagsChange([]); }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isFocused && query && filteredTags.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 surface rounded-lg shadow-lg animate-slide-up">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground px-3 py-2">Sugerido</p>
          <div className="flex flex-col gap-1">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleSelectTag(tag)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
              >
                <TagChip tag={tag} size="sm" />
                <span className="text-xs text-muted-foreground">Classificar em {tag.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
