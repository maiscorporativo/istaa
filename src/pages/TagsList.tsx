import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TagChip } from '../components/TagChip';
import { Plus, Tag as TagIcon, X } from 'lucide-react';
import type { TagCategory } from '../types';

const CATEGORIES: TagCategory[] = ['Modalidade', 'Liga', 'Evento Global', 'País', 'Região', 'Tipo de Serviço', 'Outro'];

export function TagsList() {
  const { tags, addTag } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>('Modalidade');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  const groupedTags = CATEGORIES.map(cat => ({
    category: cat,
    items: tags.filter(t => t.category === cat)
  })).filter(g => g.items.length > 0 || g.category === 'Modalidade');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    addTag({
      name: newTagName,
      slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
      category: newTagCategory,
      color: newTagColor,
    });
    
    setIsAdding(false);
    setNewTagName('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Descritores / Tags</h1>
          <p className="text-slate-400 mt-2">Gerencie as tags usadas para indexar as entidades.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nova Tag
        </button>
      </div>

      {isAdding && (
        <div className="card border-brand-500/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-brand-400" /> Cadastrar Nova Tag
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Tag</label>
              <input 
                type="text" required autoFocus
                className="input-dark" placeholder="Ex: Premier League"
                value={newTagName} onChange={e => setNewTagName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
              <select 
                className="input-dark appearance-none"
                value={newTagCategory} onChange={e => setNewTagCategory(e.target.value as TagCategory)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-11 shrink-0 rounded-xl border border-white/10 overflow-hidden">
                <input type="color" className="w-[150%] h-[150%] -ml-2 -mt-2 cursor-pointer" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedTags.map(group => (
          <div key={group.category} className="card bg-surface-900/40">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 pb-2 border-b border-white/5">
              {group.category} <span className="text-slate-500 font-normal">({group.items.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.length > 0 ? group.items.map(tag => (
                <TagChip key={tag.id} tag={tag} />
              )) : (
                <p className="text-xs text-slate-500 italic">Nenhuma tag cadastrada</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
