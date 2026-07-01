import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log("Iniciando migração de dados do Supabase para o MySQL...");
  
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'guia_parceiros'
  });

  try {
    // 1. Migrate Tags
    console.log("Buscando Tags...");
    const { data: tags, error: tagsError } = await supabase.from('tags').select('*');
    if (tags && tags.length > 0) {
      console.log(`Migrando ${tags.length} tags...`);
      for (const tag of tags) {
        await pool.query(
          'INSERT IGNORE INTO tags (id, name, slug, category, color) VALUES (?, ?, ?, ?, ?)',
          [tag.id, tag.name, tag.slug, tag.category, tag.color || '#3b82f6']
        );
      }
    }

    // 2. Migrate Organizations
    console.log("Buscando Organizações...");
    const { data: orgs, error: orgsError } = await supabase.from('organizations').select('*');
    if (orgs && orgs.length > 0) {
      console.log(`Migrando ${orgs.length} organizações...`);
      for (const org of orgs) {
        await pool.query(
          'INSERT IGNORE INTO organizations (id, name, site, status, logo_url, description, country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [org.id, org.name, org.site, org.status || 'Em análise', org.logo_url, org.description, org.country, org.created_at, org.updated_at]
        );
      }
    }

    // 3. Migrate Contacts
    console.log("Buscando Contatos...");
    const { data: contacts, error: contactsError } = await supabase.from('contacts').select('*');
    if (contacts && contacts.length > 0) {
      console.log(`Migrando ${contacts.length} contatos...`);
      for (const contact of contacts) {
        await pool.query(
          'INSERT IGNORE INTO contacts (id, org_id, name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
          [contact.id, contact.org_id, contact.name, contact.email, contact.phone, contact.role]
        );
      }
    }

    // 4. Migrate Organization Tags (Relations)
    console.log("Buscando Relacionamentos (Organizações e Tags)...");
    const { data: orgTags, error: orgTagsError } = await supabase.from('organization_tags').select('*');
    if (orgTags && orgTags.length > 0) {
      console.log(`Migrando ${orgTags.length} relacionamentos...`);
      for (const ot of orgTags) {
        await pool.query(
          'INSERT IGNORE INTO organization_tags (org_id, tag_id) VALUES (?, ?)',
          [ot.org_id, ot.tag_id]
        );
      }
    }

    console.log("Migração concluída com sucesso! 🎉");
  } catch (err) {
    console.error("Erro durante a migração:", err);
  } finally {
    pool.end();
    process.exit();
  }
}

migrate();
