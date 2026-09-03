# Public Restroom & Amenities Finder 🚻💧🪑

A modern, fast, crowdsourced geospatial web application designed to help people locate clean, accessible public restrooms, cold drinking water refill stations, and quiet resting/seating spots in unfamiliar urban areas.

## Features

- 🗺️ **Interactive Geospatial Map:** Fast OpenStreetMap vector tiles powered by Leaflet, centered around real-time GPS coordinates.
- 📍 **Crowdsourced Pin-Dropping:** Tap-to-add amenity mode with a draggable marker to drop precise location coordinates with ease.
- ♿ **Comprehensive Accessibility Filters:** Filter by wheelchair accessibility, gender-neutral restrooms, baby changing stations, and free vs paid facilities.
- 🔑 **Access Code Community Sharing:** Store and share optional door codes or tokens needed for customer/public access.
- 🛡️ **Defensive Verification System:** One-tap community verification (*"Operational"*, *"Needs Maintenance"*, *"Closed"*) to combat outdated data.
- ⭐ **Actionable Ratings & Cleanliness Metrics:** Track both overall amenity rating and separate cleanliness scores with real-time feedback.
- 📱 **Mobile-First & Responsive:** Responsive layout with smooth bottom drawer navigation and instant map/list view toggle.
- 🔒 **Zero-Trust Hardening:** Strict Zod schema validation, DOMPurify XSS sanitization, rate-limiting on submission endpoints, and secure API error handling.

## Technology Stack

- **Framework:** Next.js 14+ (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS, Lucide React icons
- **Geospatial & Mapping:** Leaflet, React-Leaflet, OpenStreetMap
- **Data & ORM:** Prisma ORM (SQLite for local development, PostgreSQL ready)
- **Validation & Security:** Zod, DOMPurify (`isomorphic-dompurify`), Sliding-window rate limiter
- **Testing:** Vitest, ESLint, TypeScript Strict Mode
- **Infrastructure:** Multi-stage Dockerfile (non-root `nextjs` user), GitHub Actions CI pipeline

## Getting Started

### 1. Prerequisites
- Node.js LTS (>= 18.x)
- npm (>= 9.x)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/wishwadeepa/-Public-Restroom-Amenities-Finder.git
cd -Public-Restroom-Amenities-Finder

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to SQLite dev database
npm run db:push

# Seed sample amenities (Downtown San Francisco)
npm run db:seed
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/amenities` | Spatial query for amenities by bounding box (`bbox`), category, and search |
| `POST` | `/api/amenities` | Create new crowdsourced amenity (rate-limited, validated, sanitized) |
| `GET` | `/api/amenities/[id]` | Fetch amenity details including ratings and verifications |
| `POST` | `/api/amenities/[id]/verifications` | One-tap status update (*"OPERATIONAL"*, *"OUT_OF_ORDER"*, *"CLOSED"*) |
| `POST` | `/api/amenities/[id]/reviews` | Submit star rating (1–5), cleanliness score, and comments |
| `GET` | `/api/health` | Uptime and database health probe |

## Testing & Quality

```bash
# Run unit & security tests
npm test

# Run ESLint
npm run lint

# Check TypeScript types
npx tsc --noEmit
```
>>>>>>> 39605dd (feat: initial release of Public Restroom and Amenities Finder platform)
