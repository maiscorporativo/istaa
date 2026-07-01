// src/components/TagChip.tsx
import clsx from 'clsx';
import { Dumbbell, Trophy, Globe2, Flag, MapPin, Star, Tag as TagIcon, type LucideIcon } from 'lucide-react';
import type { Tag, TagCategory } from '../types';

const categoryIcons: Record<TagCategory, LucideIcon> = {
  'Modalidade': Dumbbell,
  'Liga': Trophy,
  'Evento Global': Globe2,
  'País': Flag,
  'Região': MapPin,
  'Tipo de Serviço': Star,
  'Outro': TagIcon,
};

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function TagChip({ tag, onRemove, size = 'md' }: TagChipProps) {
  const Icon = categoryIcons[tag.category];

  return (
    <span
      className={clsx(
        'chip',
        size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1',
      )}
      style={{
        backgroundColor: `${tag.color}14`,
        borderColor: `${tag.color}45`,
        color: tag.color,
      }}
    >
      <Icon className={clsx(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5', 'shrink-0')} />
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
