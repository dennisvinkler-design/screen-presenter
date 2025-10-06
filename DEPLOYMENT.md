# Ensemble Presenter - Vercel Deployment Guide

Denne guide beskriver hvordan du deployer Ensemble Presenter på Vercel med Supabase backend.

## 🚀 Quick Start

### 1. Opret Supabase Projekt

1. Gå til [supabase.com](https://supabase.com) og opret en ny konto
2. Klik "New Project"
3. Vælg organization og giv projektet et navn (f.eks. "ensemble-presenter")
4. Vælg en region tæt på dine brugere
5. Vælg et password til databasen
6. Klik "Create new project"

### 2. Opsæt Database

Når Supabase projektet er oprettet:

```bash
# Installer Supabase CLI
npm install -g supabase

# Login til Supabase
supabase login

# Link til dit projekt
supabase link --project-ref YOUR_PROJECT_REF

# Kør migrations
supabase db push
```

### 3. Opret Vercel Projekt

1. Gå til [vercel.com](https://vercel.com) og login
2. Klik "New Project"
3. Import dit repository eller upload koden
4. Vælg Next.js framework
5. Klik "Deploy"

### 4. Konfigurer Environment Variables

I Vercel dashboard:

1. Gå til dit projekt
2. Klik "Settings" → "Environment Variables"
3. Tilføj følgende variabler:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Redeploy

Efter at have tilføjet environment variables:
1. Gå til "Deployments" tab
2. Klik "Redeploy" på den seneste deployment

## 🔧 Local Development

```bash
# Klon repository
git clone <your-repo-url>
cd ensemble-presenter-vercel

# Installer dependencies
npm install

# Kopier environment fil
cp env.example .env.local

# Rediger .env.local med dine Supabase credentials

# Start Supabase lokalt (optional)
npm run supabase:start

# Start development server
npm run dev
```

## 📊 Supabase Setup Details

### Database Schema

Projektet bruger følgende tabel:

```sql
CREATE TABLE presentations (
  id TEXT PRIMARY KEY DEFAULT 'default',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_slide_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security

RLS er aktiveret med en permissive policy for nem udvikling. I produktion bør du:

1. Tilføje authentication
2. Tilpasse RLS policies til din brugssituation
3. Måske tilføje customer_id til presentations tabellen

## 🌐 Custom Domain Setup

### For Kunden

1. I Vercel dashboard:
   - Gå til "Settings" → "Domains"
   - Tilføj kundens subdomain (f.eks. `presenter.kunde.com`)

2. Kunden skal i deres DNS provider:
   - Oprette en CNAME record
   - Point `presenter` til `cname.vercel-dns.com`

### DNS Configuration

```
Type: CNAME
Name: presenter
Value: cname.vercel-dns.com
```

## 👥 Kunde Overførsel

### Step 1: Inviter Kunde til Vercel

1. I Vercel dashboard:
   - Gå til "Settings" → "Members"
   - Klik "Invite Members"
   - Indtast kundens email
   - Vælg "Admin" eller "Developer" role

### Step 2: Inviter Kunde til Supabase

1. I Supabase dashboard:
   - Gå til "Settings" → "Team"
   - Klik "Invite a member"
   - Indtast kundens email
   - Vælg "Owner" role

### Step 3: Overfør Ownership

1. I Vercel: Giv kunden "Owner" role
2. I Supabase: Giv kunden "Owner" role
3. Kunden kan nu administrere begge services

## 🔍 Monitoring & Maintenance

### Vercel Analytics

- Automatisk aktiveret for alle projekter
- Se i "Analytics" tab i Vercel dashboard

### Supabase Monitoring

- Database metrics i Supabase dashboard
- Logs og queries kan ses i "Logs" sektionen

### Error Tracking

- Client-side errors logges til console
- Overvej at tilføje Sentry for bedre error tracking

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Check at API routes har korrekte headers
2. **Database Connection**: Verificer environment variables
3. **Build Failures**: Check at alle dependencies er installeret

### Debug Commands

```bash
# Check Supabase connection
npm run supabase:status

# View database logs
supabase logs

# Check Vercel deployment logs
vercel logs
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
