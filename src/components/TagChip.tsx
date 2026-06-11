// src/components/TagChip.tsx
import clsx from 'clsx';
import type { Tag, TagCategory } from '../types';

const categoryIcons: Record<TagCategory, string> = {
  'Modalidade': '⚽',
  'Liga': '🏆',
  'Evento Global': '🌍',
  'País': '🌐',
  'Região': '📍',
  'Tipo de Serviço': '⭐',
  'Outro': '🔖',
};

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function TagChip({ tag, onRemove, size = 'md' }: TagChipProps) {
  return (
    <span
      className={clsx(
        'chip border',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
      )}
      style={{
        backgroundColor: `${tag.color}18`,
        borderColor: `${tag.color}40`,
        color: tag.color,
      }}
    >
      <span>{categoryIcons[tag.category]}</span>
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 opacity-60 hover:opacity-100 transition-opacity leading-none"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
