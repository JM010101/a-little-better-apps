const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please add:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupTables() {
  console.log('🏗️  Setting up A Little Better Apps Store database...')
  
  try {
    // Test connection first
    const { error: connectionTest } = await supabase
      .from('apps')
      .select('id')
      .limit(1)

    if (connectionTest) {
      console.log('📋 Creating database tables...')
      console.log('')
      console.log('⚠️  Please run this SQL in your Supabase SQL Editor:')
      console.log('')
      console.log(`
-- App Categories Table
CREATE TABLE IF NOT EXISTS app_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apps Table
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    icon_url TEXT,
    screenshot_urls JSONB,
    app_url TEXT NOT NULL,
    category_id UUID REFERENCES app_categories(id) ON DELETE SET NULL,
    developer TEXT,
    version TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Ratings Table
CREATE TABLE IF NOT EXISTS app_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(app_id, user_id)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_category_id ON apps(category_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(featured);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at);
CREATE INDEX IF NOT EXISTS idx_app_categories_slug ON app_categories(slug);
CREATE INDEX IF NOT EXISTS idx_app_ratings_app_id ON app_ratings(app_id);
CREATE INDEX IF NOT EXISTS idx_app_ratings_user_id ON app_ratings(user_id);

-- Enable Row Level Security
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_categories
DROP POLICY IF EXISTS "Public can read categories" ON app_categories;
CREATE POLICY "Public can read categories" ON app_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create categories" ON app_categories;
CREATE POLICY "Authenticated users can create categories" ON app_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role can manage categories" ON app_categories;
CREATE POLICY "Service role can manage categories" ON app_categories
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for apps
DROP POLICY IF EXISTS "Public can read published apps" ON apps;
CREATE POLICY "Public can read published apps" ON apps
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can create apps" ON apps;
CREATE POLICY "Authenticated users can create apps" ON apps
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own apps" ON apps;
CREATE POLICY "Users can update their own apps" ON apps
    FOR UPDATE USING (auth.uid()::text = apps.developer);

DROP POLICY IF EXISTS "Users can delete their own apps" ON apps;
CREATE POLICY "Users can delete their own apps" ON apps
    FOR DELETE USING (auth.uid()::text = apps.developer);

-- RLS Policies for app_ratings
DROP POLICY IF EXISTS "Public can read ratings" ON app_ratings;
CREATE POLICY "Public can read ratings" ON app_ratings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create ratings" ON app_ratings;
CREATE POLICY "Authenticated users can create ratings" ON app_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON app_ratings;
CREATE POLICY "Users can update their own ratings" ON app_ratings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON app_ratings;
CREATE POLICY "Users can delete their own ratings" ON app_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_app_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_apps_updated_at ON apps;
CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW
    EXECUTE FUNCTION update_apps_updated_at();

DROP TRIGGER IF EXISTS update_app_ratings_updated_at ON app_ratings;
CREATE TRIGGER update_app_ratings_updated_at
    BEFORE UPDATE ON app_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_ratings_updated_at();
      `)
      console.log('')
      console.log('Then run: npm run setup')
    } else {
      console.log('✅ Database tables already exist!')
      console.log('🎉 Your apps store database is ready!')
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupTables()

