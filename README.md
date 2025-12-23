# A Little Better App Store

App marketplace/store for A Little Better platform, deployed at `apps.a-little-better.com`.

## Features

- **App Discovery**: Browse and search through available apps
- **App Details**: Detailed app pages with screenshots, descriptions, and ratings
- **Ratings & Reviews**: 5-star rating system with optional reviews
- **Categories**: Organize apps by categories
- **Featured Apps**: Highlight featured apps on the homepage
- **Search**: Full-text search across app names and descriptions
- **SEO**: Sitemap, robots.txt, structured data

## Setup

1. **Install dependencies:**

   ```bash
   cd apps
   npm install
   ```
2. **Configure environment variables:**
   Create a `.env.local` file:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (recommended for seeding)
   ```
3. **Set up database:**
   Run the SQL script from `scripts/setup-database.js` in your Supabase SQL Editor, then:

   ```bash
   npm run setup
   ```
4. **Seed initial data (optional):**

   ```bash
   node scripts/seed-data.js
   ```
5. **Run development server:**

   ```bash
   npm run dev
   ```

   The app store will be available at `http://localhost:3000`

## Database Schema

The app store uses the following Supabase tables:

- `apps` - App listings
- `app_categories` - App categories
- `app_ratings` - App ratings and reviews

All tables have Row Level Security (RLS) policies enabled.

## Deployment

This app is configured to deploy to `apps.a-little-better.com` on Vercel.

1. Create a new Vercel project for the app store
2. Set the root directory to `apps/`
3. Configure environment variables in Vercel dashboard
4. Set up the subdomain `apps.a-little-better.com` in Vercel project settings

## Project Structure

```
apps/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/         # API routes
│   │   ├── app/         # App detail pages
│   │   └── ...
│   ├── components/       # React components
│   │   ├── app/         # App-specific components
│   │   └── ui/          # UI components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── scripts/             # Setup scripts
└── public/               # Static assets
```

## API Routes

- `GET /api/apps` - List apps with filters
- `POST /api/apps` - Create a new app
- `GET /api/apps/[id]` - Get a single app
- `PUT /api/apps/[id]` - Update an app
- `DELETE /api/apps/[id]` - Delete an app
- `POST /api/apps/[id]/rate` - Rate an app
- `GET /api/categories` - List categories
- `GET /api/search` - Search apps

## License

Private - A Little Better
