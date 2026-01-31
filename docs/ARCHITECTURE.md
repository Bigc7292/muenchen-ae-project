# Muenchen.de Website Clone - Architecture Documentation

## Original Site Analysis

### CMS Platform
- **Framework**: Drupal 9/10 (PHP-based CMS)
- **Theme**: Custom theme `muenchen` with Bootstrap integration
- **Base Theme**: Stable (Drupal contrib)

### Key Features Identified

#### 1. Content Management
- **Paragraphs Module**: Flexible content building blocks
- **Multi-language Support**: 8 languages (DE, EN, FR, IT, ES, RU, AR, ZH-Hans)
- **Content Types**: Pages, Events, News, Business Directory, POIs

#### 2. Authentication
- **SSO Provider**: Keycloak
- **Realm**: public
- **Client ID**: mpdz-fragments
- **User Portal**: stadt.muenchen.de/mein-bereich

#### 3. Third-Party Integrations
- **Analytics**: eTracker (code: Shbe3K)
- **Cookie Consent**: Usercentrics (settings-id: 8cHg-EU0P)
- **APIs**: muenchenapis.de for proxy services

#### 4. Frontend Technologies
- **CSS Framework**: Bootstrap 5
- **JavaScript**: ES6 Modules
- **Icons**: SVG sprite system
- **PWA**: manifest.json for Progressive Web App support

---

## Recommended Backend Architecture (Node.js/Express)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   CLIENTS    │
                              │  (Browser)   │
                              └──────┬───────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    NGINX / CDN        │
                         │  (Load Balancer)      │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │  FRONTEND APP   │   │   API SERVER    │   │  ADMIN PANEL    │
    │  (Static/SSR)   │   │  (Express.js)   │   │   (React/Vue)   │
    └─────────────────┘   └────────┬────────┘   └─────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AUTH SERVICE  │     │  CONTENT API    │     │  SEARCH SERVICE │
│   (Keycloak)    │     │   (REST/GQL)    │     │ (Elasticsearch) │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │ PostgreSQL│ │   Redis   │ │    S3     │
            │ (Database)│ │  (Cache)  │ │  (Media)  │
            └───────────┘ └───────────┘ └───────────┘
```

---

## Content Types & Data Models

### 1. Pages (Seiten)
- Homepage, Freizeit, Leben, Rathaus, Wirtschaft
- Hierarchical structure with parent/child relationships

### 2. Events (Veranstaltungen)
- Date/time, location, categories
- Recurring events support

### 3. News (Aktuell/Nachrichten)
- Publication date, author, categories
- Featured images, related content

### 4. Business Directory (Branchenbuch)
- Business listings with categories
- Contact info, hours, location

### 5. Points of Interest (Sehenswürdigkeiten)
- Tourist attractions, landmarks
- Maps integration, photos

### 6. Districts (Stadtteile)
- Geographic areas
- Related content per district

### 7. Accommodations (Übernachten)
- Hotels, hostels, vacation rentals
- Booking integration potential

---

## Language Support

| Code    | Language   | URL Pattern        |
|---------|------------|-------------------|
| de      | German     | / (default)       |
| en      | English    | /en/              |
| fr      | French     | /fr/              |
| it      | Italian    | /it/              |
| es      | Spanish    | /es/              |
| ru      | Russian    | /ru/              |
| ar      | Arabic     | /ar/ (RTL)        |
| zh-hans | Chinese    | /zh-hans/         |

---

## API Endpoints Structure

```
/api/v1/
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   └── GET    /me
│
├── /content
│   ├── GET    /pages
│   ├── GET    /pages/:slug
│   ├── POST   /pages (admin)
│   ├── PUT    /pages/:id (admin)
│   └── DELETE /pages/:id (admin)
│
├── /events
│   ├── GET    /
│   ├── GET    /:id
│   ├── GET    /upcoming
│   └── GET    /by-date/:date
│
├── /news
│   ├── GET    /
│   ├── GET    /:id
│   └── GET    /latest
│
├── /business
│   ├── GET    /
│   ├── GET    /:id
│   ├── GET    /categories
│   └── GET    /search
│
├── /locations
│   ├── GET    /districts
│   ├── GET    /pois
│   └── GET    /accommodations
│
├── /search
│   └── GET    /?query=
│
├── /media
│   ├── GET    /:id
│   └── POST   /upload (admin)
│
└── /i18n
    ├── GET    /languages
    └── GET    /translations/:lang
```

---

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: API request throttling
4. **CORS**: Configured for allowed origins
5. **Input Validation**: Sanitize all user inputs
6. **HTTPS**: SSL/TLS encryption required
7. **Cookie Security**: HttpOnly, Secure, SameSite flags

---

## Deployment Options

1. **Docker Compose** (Development/Staging)
2. **Kubernetes** (Production)
3. **Cloud Platforms**: AWS, GCP, Azure
4. **Serverless**: Vercel, Netlify (Frontend)

