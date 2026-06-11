const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('../Membros e Parceiros ISTAA - Detalhado.xlsx');
const sheetName = wb.SheetNames[0];
const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

// Extract unique tags and build organizations
const organizations = [];
const tagsMap = new Map();

let tagIdCounter = 1;
const getOrCreateTag = (name, category, color) => {
  const normalized = name.trim();
  if (!normalized) return null;
  const slug = normalized.toLowerCase().replace(/\s+/g, '-');
  
  if (!tagsMap.has(slug)) {
    tagsMap.set(slug, {
      id: `t${tagIdCounter++}`,
      name: normalized,
      slug,
      category,
      color
    });
  }
  return tagsMap.get(slug);
};

// Hardcoded tag colors based on category
const catColors = {
  'Modalidade': '#3b82f6', // blue
  'Liga': '#ef4444', // red
  'Evento Global': '#eab308', // yellow
  'País': '#22c55e', // green
  'Tipo de Serviço': '#a855f7' // purple
};

data.forEach((row, index) => {
  if (!row["Nome da Organização / Membro"]) return;

  const orgId = `org_${index + 1}`;
  const name = row["Nome da Organização / Membro"];
  const site = row["Site"] || '';
  const country = row["LOCAL"] || '';
  const contactsRaw = row["Contatos"] || '';
  const sportArea = row["Área Esportiva"] || '';
  const events = row["Ligas / Eventos Cobertos"] || '';

  const orgTags = [];

  // Parse Country Tag
  if (country) {
    const t = getOrCreateTag(country, 'País', catColors['País']);
    if (t) orgTags.push(t);
  }

  // Parse Sport Areas
  if (sportArea) {
    const areas = sportArea.split(/[,/]+/).map(s => s.trim()).filter(Boolean);
    areas.forEach(a => {
      const t = getOrCreateTag(a, 'Modalidade', catColors['Modalidade']);
      if (t && !orgTags.find(x => x.id === t.id)) orgTags.push(t);
    });
  }

  // Parse Events
  if (events) {
    const evts = events.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
    evts.forEach(e => {
      const isGlobal = e.toLowerCase().includes('copa') || e.toLowerCase().includes('olimpíadas') || e.toLowerCase().includes('mundial');
      const t = getOrCreateTag(e, isGlobal ? 'Evento Global' : 'Liga', isGlobal ? catColors['Evento Global'] : catColors['Liga']);
      if (t && !orgTags.find(x => x.id === t.id)) orgTags.push(t);
    });
  }

  // Parse Contacts
  const contacts = [];
  if (contactsRaw) {
    const parts = contactsRaw.split('-');
    if (parts.length >= 2) {
      contacts.push({
        id: `c_${orgId}_1`,
        name: parts[0].trim(),
        phone: parts[1].trim()
      });
    } else {
      contacts.push({
        id: `c_${orgId}_1`,
        name: contactsRaw.trim()
      });
    }
  }

  organizations.push({
    id: orgId,
    name,
    site,
    status: 'Ativo',
    logo_url: `https://placehold.co/80x80/1e293b/3b82f6?text=${name.substring(0,2).toUpperCase()}`,
    description: `${sportArea ? sportArea + '. ' : ''}${events ? 'Cobertura: ' + events : ''}`,
    country,
    contacts,
    tags: orgTags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
});

const mockTags = Array.from(tagsMap.values());

const tsOutput = `// src/data/mockData.ts
// AUTO-GENERATED FROM EXCEL
import type { Organization, Tag } from '../types';

export const MOCK_TAGS: Tag[] = ${JSON.stringify(mockTags, null, 2)};

export const MOCK_ORGANIZATIONS: Organization[] = ${JSON.stringify(organizations, null, 2)};
`;

fs.writeFileSync('./src/data/mockData.ts', tsOutput);
console.log('Successfully generated mockData.ts with ' + organizations.length + ' organizations and ' + mockTags.length + ' tags.');
