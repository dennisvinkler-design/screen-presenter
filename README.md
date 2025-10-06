# Ensemble: Synchronized Multi-Screen Presenter (Vercel Version)

> A web-based presentation tool for synchronizing different image slideshows across multiple screens, controlled with a simple, elegant interface.

This is the Vercel-optimized version of Ensemble, designed for easy deployment and customer handover. It uses Next.js API routes and Supabase for backend functionality.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ensemble-presenter-vercel)

## ✨ Features

- **Synchronized Multi-Screen Control**: Drive unique content on multiple displays from a single control panel
- **Simple, Intuitive Interface**: Clean, dark-themed Presenter View designed for low-light event environments
- **Effortless Navigation**: Control the slideshow with large on-screen buttons or keyboard arrow keys
- **Dedicated Display Views**: Chromeless, full-screen views for each physical display
- **Web-Based & Stable**: Runs entirely in a browser with Vercel's global edge network
- **Easy Customer Handover**: Designed for seamless transfer to customers

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Vercel API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- A Supabase account
- A Vercel account

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd ensemble-presenter-vercel
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your Supabase credentials
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📱 Usage

1. **Open the Presenter Control Panel**: Navigate to the root URL on your control machine
2. **Open Display Screens**: On each physical display, open a browser in full-screen mode and navigate to:
   - Screen 1: `/display/1`
   - Screen 2: `/display/2` 
   - Screen 3: `/display/3`
3. **Control the Presentation**: Use the "Next" and "Previous" buttons or arrow keys to navigate

## 👥 Customer Handover

This version is specifically designed for easy customer handover:

1. Deploy to your Vercel account
2. Set up custom domain (e.g., `presenter.customer.com`)
3. Invite customer to both Vercel and Supabase projects
4. Transfer ownership to customer
5. Customer updates their DNS to point to the custom domain

## 🏗️ Project Structure

```
├── api/                    # Vercel API routes
│   ├── presentation/
│   │   └── state.ts       # Presentation state management
│   └── health.ts          # Health check endpoint
├── supabase/              # Database migrations
│   ├── migrations/
│   └── config.toml
├── src/                   # Next.js app directory
│   ├── app/              # Next.js 13+ app router
│   │   ├── display/      # Display screen pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main presenter page
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── SlideEditor.tsx
│   │   └── ImageWithLoader.tsx
│   ├── store/           # Zustand store
│   └── lib/             # Utilities
├── vercel.json          # Vercel configuration
└── DEPLOYMENT.md        # Deployment guide
```

## 🔧 API Endpoints

- `GET /api/presentation/state` - Get current presentation state
- `POST /api/presentation/state` - Update presentation state
- `GET /api/health` - Health check

## 🎨 Customization

### Adding More Screens

To support more than 3 screens:

1. Update the `Slide` interface in the codebase
2. Modify the database schema if needed
3. Update the UI components

### Styling

The app uses Tailwind CSS with a dark theme. Customize colors in `tailwind.config.js` and CSS variables in `src/index.css`.

## 📊 Monitoring

- **Vercel Analytics**: Automatic performance monitoring
- **Supabase Dashboard**: Database metrics and logs
- **Client Error Logging**: Errors are logged to console and can be sent to external services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For technical support, please open an issue in the repository.