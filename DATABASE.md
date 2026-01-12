# Database Documentation

## Overview
MySQL database for managing the photography portfolio with photos, sessions, users, and tags.

**Database Name:** `dani_portfolio`  
**Total Photos:** 448 (as of Dec 2025)  
**Storage:** All photos stored in `public/foto-sito/`

---

## Database Schema

### Tables

#### 1. `photos` - Main photo storage
Stores all photograph metadata and file information.

```sql
CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  location VARCHAR(255),
  date_taken VARCHAR(100),
  category VARCHAR(100),
  session_slug VARCHAR(255) NULL,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_session (session_slug),
  INDEX idx_published (published),
  INDEX idx_created (created_at)
);
```

**Key Fields:**
- `session_slug` - Groups photos into collections/albums (e.g., "alice-candid-moments")
- `slug` - Unique URL identifier for individual photos
- `filepath` - Relative path from public directory (e.g., `/foto-sito/photo.jpg`)
- `published` - Controls visibility on frontend

#### 2. `users` - Admin authentication
Manages admin users who can upload and manage photos.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. `tags` - Photo categorization
Defines available tags for photo organization.

```sql
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `photo_tags` - Many-to-many relationship
Links photos to multiple tags.

```sql
CREATE TABLE photo_tags (
  photo_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (photo_id, tag_id),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## Photo Sessions Concept

### What is a Session?
A **session** is a collection of related photos grouped by the `session_slug` field. Multiple photos can share the same `session_slug` to form an album/gallery.

### Session Examples:
- `alice-candid-moments` - Candid portrait session
- `verona-streets` - Street photography collection
- `lake-garda-sunset` - Landscape series

### Session Routes:
- **All sessions:** `/api/sessions` - Lists all available sessions
- **Single session:** `/api/sessions/{slug}` - Returns all photos in that session
- **Frontend view:** `/session/{slug}` - Displays session gallery with lightbox

### Dynamic Schema Migration
The `session_slug` column is added automatically at runtime if it doesn't exist:

```typescript
// From server/api/sessions/[slug].get.ts
const columns = await query("SHOW COLUMNS FROM photos LIKE 'session_slug'")
if (!Array.isArray(columns) || columns.length === 0) {
  await query("ALTER TABLE photos ADD COLUMN session_slug VARCHAR(255) NULL, ADD INDEX idx_session (session_slug)")
}
```

---

## Common Queries

### Get all published photos with tags
```sql
SELECT 
  p.*, 
  GROUP_CONCAT(t.name) as tags
FROM photos p
LEFT JOIN photo_tags pt ON p.id = pt.photo_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.published = 1
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Get all photos in a session
```sql
SELECT * FROM photos 
WHERE session_slug = 'alice-candid-moments' 
  AND published = 1
ORDER BY created_at DESC;
```

### Get all sessions with photo counts
```sql
SELECT 
  session_slug, 
  COUNT(*) as photo_count,
  MAX(created_at) as latest_photo
FROM photos
WHERE session_slug IS NOT NULL 
  AND session_slug <> ''
  AND published = 1
GROUP BY session_slug
ORDER BY latest_photo DESC;
```

### Find photos without a session
```sql
SELECT * FROM photos
WHERE session_slug IS NULL OR session_slug = ''
ORDER BY created_at DESC;
```

---

## Database Maintenance

### Cleanup Unused Photos
Removes image files from `public/foto-sito/` that aren't referenced in the database:

```bash
node scripts/cleanup-unused-photos.js
```

### Remove Duplicate Entries
Check for duplicate titles (case-insensitive):

```sql
SELECT LOWER(title), COUNT(*) as count 
FROM photos 
GROUP BY LOWER(title) 
HAVING count > 1;
```

### Photo Statistics
```sql
-- Total photos
SELECT COUNT(*) FROM photos;

-- Published vs unpublished
SELECT published, COUNT(*) 
FROM photos 
GROUP BY published;

-- Photos by session
SELECT session_slug, COUNT(*) as count
FROM photos
WHERE session_slug IS NOT NULL
GROUP BY session_slug
ORDER BY count DESC;

-- Photos without tags
SELECT COUNT(*) 
FROM photos p
LEFT JOIN photo_tags pt ON p.id = pt.photo_id
WHERE pt.photo_id IS NULL;
```

---

## Environment Variables

Required for database connection:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dani_portfolio
JWT_SECRET=your_jwt_secret_key
```

---

## Backup & Restore

### Backup Database
```bash
mysqldump -u root -p dani_portfolio > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p dani_portfolio < backup_20251219.sql
```

### Backup Photos
```bash
tar -czf photos_backup_$(date +%Y%m%d).tar.gz public/foto-sito/
```

---

## File Organization

### Photo Storage Structure
```
public/
└── foto-sito/
    ├── alice_alice-candid-moments_1_1765984201316.jpg
    ├── alice_alice-candid-moments_2_1765984202231.JPG
    ├── verona_streets_panorama_1765895123456.jpg
    └── ... (448 total photos)
```

**Naming Convention:**
`{subject}_{session-slug}_{number}_{timestamp}.{ext}`

### Database References
All `filepath` values in the database use the format:
```
/foto-sito/{filename}
```

This allows the frontend to load images with:
```vue
<img :src="photo.filepath" />
```

---

## Data Integrity Checks

### Verify all database photos exist as files
```javascript
// Check if all DB photos have corresponding files
const [photos] = await query('SELECT filepath FROM photos');
for (const photo of photos) {
  const filePath = path.join('public', photo.filepath);
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  if (!exists) console.log('Missing file:', photo.filepath);
}
```

### Verify all files are in database
```bash
node scripts/cleanup-unused-photos.js
# Shows count of orphaned files
```

---

## Performance Optimization

### Indexes
All critical fields are indexed:
- `slug` - Fast photo lookup by URL
- `session_slug` - Fast session queries
- `published` - Filter published photos
- `created_at` - Chronological sorting

### Query Tips
1. Always use `published = 1` filter for frontend queries
2. Use `GROUP BY` with `GROUP_CONCAT` for tags to avoid N+1 queries
3. Limit results with `LIMIT` for pagination
4. Use `COUNT(DISTINCT)` when counting unique sessions

---

## Current Statistics (Dec 2025)

- **Total Photos:** 448
- **Physical Files:** 448 (cleaned up from 808)
- **Sessions:** Multiple (Alice candid moments, etc.)
- **Published Photos:** ~448 (verify with query)
- **Storage Format:** JPEG/JPG
- **Average File Size:** ~2-5MB per photo

---

## Troubleshooting

### "Column session_slug doesn't exist"
The API automatically adds it. If issues persist:
```sql
ALTER TABLE photos 
ADD COLUMN session_slug VARCHAR(255) NULL, 
ADD INDEX idx_session (session_slug);
```

### Photos not showing on frontend
1. Check `published = 1` in database
2. Verify file exists in `public/foto-sito/`
3. Check `filepath` format starts with `/foto-sito/`
4. Clear browser cache

### Slow queries
1. Verify indexes exist: `SHOW INDEX FROM photos;`
2. Check query execution: `EXPLAIN SELECT ...`
3. Consider adding compound indexes for complex queries

---

**Last Updated:** December 19, 2025  
**Database Version:** MySQL 8.0+  
**Total Records:** 448 photos
