# Dani Banoi Photography Portfolio

A professional photography portfolio website built with **Nuxt 4**, featuring a MySQL backend, JWT authentication, bilingual support (IT/EN), and dark/light theme.

## 🎯 Project Overview

**Live Site:** Verona-based portrait and editorial photographer  
**Tech Stack:** Nuxt 4, Vue 3, MySQL, JWT, i18n  
**Photos:** 448 curated images organized in sessions  
**Languages:** Italian (default) / English

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/danibanoi-cell/dani-blog-nuxt.git
cd dani-blog-nuxt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create database and run schema
mysql -u root -p < database/schema.sql

# Start development server
npm run dev
```

The site will be available at:
- **Local:** http://localhost:3000
- **Network:** http://192.168.1.149:3000

---

## 📁 Project Structure

```
dani-blog-nuxt/
├── app/
│   ├── components/       # Vue components (HeaderBar, SidebarNav, etc.)
│   ├── composables/      # useTheme() composable for dark/light mode
│   ├── layouts/          # default.vue layout with theme CSS variables
│   ├── pages/            # File-based routing (index, session/[slug], admin)
│   └── assets/styles/    # Global fonts and styles
├── server/
│   ├── api/              # API endpoints (photos, sessions, auth)
│   └── utils/            # db.ts (MySQL pool), auth.ts (JWT)
├── database/
│   └── schema.sql        # Complete database schema
├── public/
│   └── foto-sito/        # Photo storage (448 files)
├── scripts/
│   ├── upload-photos.js              # Bulk photo upload
│   ├── upload-alice-sessions.js      # Session-based upload
│   └── cleanup-unused-photos.js      # Remove orphaned files
├── locales/
│   ├── it.json           # Italian translations
│   └── en.json           # English translations
├── DATABASE.md           # 📘 Complete database documentation
└── .github/
    └── copilot-instructions.md  # AI agent guidelines
```

---

## 🎨 Key Features

### Photo Sessions
Photos are organized into **sessions** (albums) using the `session_slug` field:
- View all sessions: `/api/sessions`
- Single session: `/session/alice-candid-moments`
- Automatic shuffling for dynamic galleries
- Fullscreen lightbox with navigation

### Internationalization (i18n)
- **Italian** (default): Routes without prefix `/`
- **English**: Routes with prefix `/en/`
- Switch languages via sidebar toggle
- Translated UI, headlines, and payoffs

### Theme System
- Dark/Light mode toggle in sidebar
- CSS custom properties (`--bg-primary`, `--text-primary`, etc.)
- Persisted to localStorage
- Smooth transitions

### Authentication
- JWT-based admin authentication
- Protected routes: `/admin/dashboard`, `/admin/login`
- Photo upload with tags, categories, and sessions
- 7-day token expiration

---

## 🗄️ Database

**See [DATABASE.md](./DATABASE.md) for complete documentation**

Quick overview:
- **Photos:** 448 records with metadata and file paths
- **Sessions:** Group photos into albums via `session_slug`
- **Tags:** Many-to-many relationship for categorization
- **Users:** Admin authentication

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE dani_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run schema
mysql -u root -p dani_portfolio < database/schema.sql
```

### Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dani_portfolio
JWT_SECRET=your_super_secret_jwt_key_change_this
```

---

## 📝 Scripts

### Development
```bash
npm run dev          # Start dev server with network access (--host)
npm run build        # Production build
npm run preview      # Preview production build
```

### Photo Management
```bash
# Upload photos from public/foto-sito
node scripts/upload-photos.js

# Upload session-based photos
node scripts/upload-alice-sessions.js

# Clean up unused files (keeps only 448 DB-referenced photos)
node scripts/cleanup-unused-photos.js
```

### Database Maintenance
```bash
# Backup database
mysqldump -u root -p dani_portfolio > backup_$(date +%Y%m%d).sql

# Backup photos
tar -czf photos_backup.tar.gz public/foto-sito/
```

---

## 🎯 API Endpoints

### Public Routes
- `GET /api/photos` - List all published photos
- `GET /api/photos?published=false` - Include unpublished
- `GET /api/sessions` - List all sessions with counts
- `GET /api/sessions/[slug]` - Get photos in a session

### Protected Routes (require JWT)
- `POST /api/photos` - Upload new photo
- `PUT /api/photos/[id]` - Update photo
- `DELETE /api/photos/[id]` - Delete photo
- `POST /api/auth/login` - Admin login

**Authentication:** Send `Authorization: Bearer <token>` header

---

## 🎨 Fonts

- **Headings:** Oswald (400, 500, 600, 700)
- **Body:** Roboto (300, 400, 500, 700)
- Loaded from Google Fonts with `display=swap`
- CSS variables: `--font-heading`, `--font-body`

---

## 🌐 SEO

- Comprehensive meta tags for Italian market (Verona, Valpolicella, Lago di Garda)
- Schema.org microdata (`itemscope`, `itemtype`, `itemprop`)
- Semantic HTML (`<main role="main">`, `<section aria-labelledby>`)
- Open Graph and Twitter Card tags
- GDPR-compliant cookie consent banner

---

## 📊 Current Statistics

- **Total Photos:** 448 (cleaned Dec 19, 2025)
- **Physical Files:** 448 in `public/foto-sito/`
- **Database Records:** 448 photos, multiple sessions
- **Languages:** 2 (IT, EN)
- **Storage:** ~1-2GB of optimized JPEG images

---

## 🔧 Troubleshooting

### Photos not loading
1. Check `published = 1` in database
2. Verify file exists in `public/foto-sito/`
3. Run cleanup script: `node scripts/cleanup-unused-photos.js`

### Database connection errors
1. Verify MySQL is running: `mysql.server status`
2. Check `.env` credentials match your MySQL setup
3. Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Language switching not working
1. Clear browser cache
2. Check i18n config in `nuxt.config.ts`
3. Verify locale files exist in `locales/`

---

## 📚 Documentation

- **[DATABASE.md](./DATABASE.md)** - Complete database schema and queries
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - AI agent development guide
- **[Nuxt 4 Docs](https://nuxt.com/docs)** - Official Nuxt documentation

---

## 🤝 Contributing

This is a private portfolio project. For questions or collaboration inquiries, contact through the website contact form.

---

## 📄 License

All photographs are original works © Dani Banoi. All rights reserved.  
Code is for portfolio purposes.

---

**Last Updated:** December 19, 2025  
**Nuxt Version:** 4.2.1  
**Node Version:** 18+  
**Database:** MySQL 8.0+
