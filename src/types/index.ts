// src/types/index.ts

export type TagCategory =
  | 'Modalidade'
  | 'Liga'
  | 'Evento Global'
  | 'País'
  | 'Região'
  | 'Tipo de Serviço'
  | 'Outro';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  color: string; // hex
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

export interface Organization {
  id: string;
  name: string;
  site?: string;
  status: 'Ativo' | 'Inativo' | 'Em análise';
  logo_url?: string;
  description?: string;
  country?: string;
  contacts: Contact[];
  tags: Tag[];
  created_at: string;
  updated_at: string;
}
