# City Portal Website Project

> A complete website clone and backend scaffolding based on muenchen.de architecture

## 📁 Project Structure

```
Muenchen Website Project/
├── www.muenchen.de/          # Cloned frontend (1,134 files, ~149MB)
│   ├── index.html             # Homepage
│   ├── themes/                # CSS, JS, assets
│   ├── sites/                 # Media files
│   ├── en/, fr/, it/...       # Language versions
│   └── [content pages]        # All cloned pages
│
├── backend/                   # Node.js API backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation, etc.
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helpers (db, cache, logger)
│   │   ├── config/            # Configuration
│   │   └── index.js           # Entry point
│   ├── database/
│   │   ├── migrations/        # Database schema
│   │   └── seeds/             # Sample data
│   ├── docker/                # Docker configuration
│   ├── package.json
│   └── .env.example
│
└── docs/                      # Documentation
    └── ARCHITECTURE.md        # System architecture
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
cd backend/docker

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec api npm run migrate
```

### Option 2: Manual Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Get current user |

### Content (Pages)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/pages` | List all pages |
| GET | `/api/v1/content/pages/:slug` | Get page by slug |
| GET | `/api/v1/content/pages/hierarchy` | Get navigation tree |
| POST | `/api/v1/content/pages` | Create page (admin) |
| PUT | `/api/v1/content/pages/:id` | Update page (admin) |
| DELETE | `/api/v1/content/pages/:id` | Delete page (admin) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/events` | List events |
| GET | `/api/v1/events/upcoming` | Get upcoming events |
| GET | `/api/v1/events/by-date/:date` | Events by date |
| GET | `/api/v1/events/:id` | Get event details |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/news` | List news |
| GET | `/api/v1/news/latest` | Get latest news |
| GET | `/api/v1/news/:id` | Get news article |

### Business Directory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/business` | List businesses |
| GET | `/api/v1/business/search` | Search businesses |
| GET | `/api/v1/business/categories` | Get categories |
| GET | `/api/v1/business/:id` | Get business details |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/locations/districts` | List districts |
| GET | `/api/v1/locations/pois` | List POIs |
| GET | `/api/v1/locations/accommodations` | List accommodations |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search?query=` | Global search |
| GET | `/api/v1/search/suggestions` | Autocomplete |

### Internationalization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/i18n/languages` | Get supported languages |
| GET | `/api/v1/i18n/translations/:lang` | Get UI translations |

## 🌍 Supported Languages

| Code | Language | Direction |
|------|----------|----------|
| de | German (default) | LTR |
| en | English | LTR |
| fr | French | LTR |
| it | Italian | LTR |
| es | Spanish | LTR |
| ru | Russian | LTR |
| ar | Arabic | RTL |
| zh-hans | Chinese (Simplified) | LTR |

## 🛠️ Rebranding Guide

### 1. Update Frontend

```bash
# Logo
www.muenchen.de/themes/custom/muenchen/logo.svg

# Favicon
www.muenchen.de/themes/custom/muenchen/assets/favicon.ico

# Colors (CSS)
www.muenchen.de/themes/custom/muenchen/css/style.css

# Site name in HTML files
Find and replace "muenchen.de" with your brand
```

### 2. Update Backend

```bash
# Edit .env file
SITE_NAME=Your City Portal
SITE_URL=https://yourdomain.com

# Update translations
backend/src/controllers/i18n.controller.js
```

### 3. Database

```bash
# Run migrations
npm run migrate

# Seed with your content
npm run seed
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control (user, editor, admin)
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Password hashing with bcrypt

## 📦 Tech Stack

**Frontend (Cloned)**
- HTML5, CSS3, JavaScript
- Bootstrap 5
- SVG icons

**Backend (Generated)**
- Node.js + Express.js
- PostgreSQL (database)
- Redis (caching)
- Knex.js (query builder)
- JWT (authentication)
- Winston (logging)
- Multer + Sharp (media processing)
- AWS S3 (media storage)

**DevOps**
- Docker + Docker Compose
- Nginx (reverse proxy)

## 📋 Next Steps

1. [ ] Configure `.env` with your credentials
2. [ ] Run database migrations
3. [ ] Replace branding (logo, colors, site name)
4. [ ] Add your content via API or admin panel
5. [ ] Configure SSL certificates for production
6. [ ] Set up CI/CD pipeline
7. [ ] Deploy to your hosting provider

## 📄 License

This project scaffold is provided for educational and development purposes.
Ensure you have proper rights before using any cloned content commercially.

---

**Created by Colin and Andy**
