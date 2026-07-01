const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Reading mockData.ts...');
  // We'll read the JSON directly from the JS context using a dirty trick since it's CommonJS
  const fileContent = fs.readFileSync('./src/data/mockData.ts', 'utf-8');
  
  // Extract JSON strings
  const tagsMatch = fileContent.match(/export const MOCK_TAGS: Tag\[\] = (\[[\s\S]*?\]);/);
  const orgsMatch = fileContent.match(/export const MOCK_ORGANIZATIONS: Organization\[\] = (\[[\s\S]*?\]);/);
  
  if (!tagsMatch || !orgsMatch) {
    console.error('Could not parse mockData.ts');
    return;
  }
  
  const tags = JSON.parse(tagsMatch[1]);
  const organizations = JSON.parse(orgsMatch[1]);

  console.log(`Found ${tags.length} tags and ${organizations.length} organizations to insert.`);

  // 1. Insert Tags
  console.log('Inserting Tags...');
  const { data: insertedTags, error: tagsError } = await supabase
    .from('tags')
    .upsert(tags.map(t => ({
      name: t.name,
      slug: t.slug,
      category: t.category,
      color: t.color
    })), { onConflict: 'slug' })
    .select();

  if (tagsError) {
    console.error('Error inserting tags:', tagsError);
    return;
  }

  // Create a map of old tag ID (from mock) to new tag UUID (from DB)
  // Actually, since we matched by slug, we can map slug -> UUID
  const slugToDbIdMap = {};
  insertedTags.forEach(t => {
    slugToDbIdMap[t.slug] = t.id;
  });

  // 2. Insert Organizations and Contacts and Links
  console.log('Inserting Organizations...');
  for (const org of organizations) {
    const { data: insertedOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: org.name,
        site: org.site,
        status: org.status,
        country: org.country,
        description: org.description,
        logo_url: org.logo_url
      })
      .select()
      .single();

    if (orgError) {
      console.error(`Error inserting org ${org.name}:`, orgError);
      continue;
    }

    // Insert Contacts
    if (org.contacts && org.contacts.length > 0) {
      await supabase.from('contacts').insert(
        org.contacts.map(c => ({
          org_id: insertedOrg.id,
          name: c.name,
          phone: c.phone || null,
          email: c.email || null,
          role: c.role || null
        }))
      );
    }

    // Insert Org_Tags mapping
    if (org.tags && org.tags.length > 0) {
      const mappings = org.tags
        .map(t => slugToDbIdMap[t.slug])
        .filter(Boolean)
        .map(tagId => ({
          org_id: insertedOrg.id,
          tag_id: tagId
        }));
      
      if (mappings.length > 0) {
        await supabase.from('organization_tags').insert(mappings);
      }
    }
  }

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
