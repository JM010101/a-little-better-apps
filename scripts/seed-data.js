const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Use service role key for seeding (bypasses RLS) or anon key if service role not available
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL')
  console.error('Required: SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Using anon key - seeding may fail due to RLS policies.')
  console.warn('   For best results, add SUPABASE_SERVICE_ROLE_KEY to .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

async function seedData() {
  console.log('🌱 Seeding app store data...')

  try {
    // Create categories
    const categories = [
      { name: 'Productivity', description: 'Apps to help you get things done' },
      { name: 'Content', description: 'Content creation and management tools' },
      { name: 'Marketing', description: 'Marketing and growth tools' },
    ]

    const categoryIds = {}
    
    for (const category of categories) {
      const slug = slugify(category.name)
      const { data: existing } = await supabase
        .from('app_categories')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        categoryIds[category.name] = existing.id
        console.log(`✅ Category "${category.name}" already exists`)
      } else {
        const { data, error } = await supabase
          .from('app_categories')
          .insert({
            name: category.name,
            slug: slug,
            description: category.description,
          })
          .select()
          .single()

        if (error) throw error
        categoryIds[category.name] = data.id
        console.log(`✅ Created category "${category.name}"`)
      }
    }

    // Create apps
    const apps = [
      {
        name: 'A Little Better',
        description: 'The main A Little Better platform - helping businesses transform through small, intentional improvements. A comprehensive SaaS solution for continuous improvement and business growth.',
        short_description: 'Transform your business through small, intentional improvements.',
        app_url: 'https://a-little-better.com',
        category: 'Productivity',
        developer: 'A Little Better Team',
        version: '1.0.0',
        featured: true,
      },
      {
        name: 'Blog',
        description: 'Content marketing platform for A Little Better. Create, publish, and manage blog posts with a full-featured CMS including comments, ratings, categories, and tags.',
        short_description: 'Content marketing and blog management platform.',
        app_url: 'https://blogs.a-little-better.com',
        category: 'Content',
        developer: 'A Little Better Team',
        version: '1.0.0',
        featured: true,
      },
    ]

    for (const app of apps) {
      const slug = slugify(app.name)
      const { data: existing } = await supabase
        .from('apps')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        console.log(`✅ App "${app.name}" already exists`)
      } else {
        const { data, error } = await supabase
          .from('apps')
          .insert({
            name: app.name,
            slug: slug,
            description: app.description,
            short_description: app.short_description,
            app_url: app.app_url,
            category_id: categoryIds[app.category],
            developer: app.developer,
            version: app.version,
            status: 'published',
            featured: app.featured,
          })
          .select()
          .single()

        if (error) throw error
        console.log(`✅ Created app "${app.name}"`)
      }
    }

    console.log('')
    console.log('🎉 Seed data created successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedData()

