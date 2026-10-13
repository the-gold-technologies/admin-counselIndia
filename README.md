# Counsel India Admin & CMS Portal

A modern, high-performance Admin Dashboard and Content Management System (CMS) engineered for the **Counsel India** platform. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, and **Cloudinary**.

---

## 🚀 Overview

The **Counsel India Admin Portal** serves as the centralized management engine for Counsel India's educational ecosystem, providing administrative control over:

- **Analytics & Dashboard Metrics**: Live KPI metrics for counselors, admissions, courses, course leads, and personality tests.
- **Counselor Management**: Comprehensive directory of certified counselors with real-time status toggling, advanced search, filtering, and detailed profile management.
- **Course & Curriculum Management**: Full catalog of psychology courses, batches, fees, and multi-tier submodules (Overview, What You'll Learn, Credentials, and Curriculum).
- **Leads & Admission Processing**: High-throughput intake pipelines for course registrations, landing page inquiries, student admissions, and bulk CSV ingestion.
- **Personality Test Engine**: Configurable psychological assessment system including tab configurations, question banks, scoring logic, and mapped outcome templates.
- **Site Settings & Branding**: Centralized control over site identity, contact emails, social links, logos, and support channels.
- **Cloudinary Asset Storage**: Automated cloud asset uploads, thumbnail generations, and asset lifecycle management.
- **Role-Based Authentication**: Secure JWT-powered sessions stored in HTTP-only cookies with bcrypt password hashing.

---

## 🛠️ Tech Stack

| Domain              | Technology                         |
| ------------------- | ---------------------------------- |
| **Framework**       | Next.js 14 / React 19 (App Router) |
| **Language**        | TypeScript                         |
| **Styling**         | Tailwind CSS & Lucide Icons        |
| **ORM**             | Prisma ORM                         |
| **Database**        | PostgreSQL                         |
| **Authentication**  | Jose (JWT) & BcryptJS              |
| **Asset Storage**   | Cloudinary SDK                     |
| **Document Export** | jsPDF                              |

---

## 📁 Repository Structure

```text
counselIndia-Admin/
├── prisma/
│   ├── schema.prisma               # Prisma relational database models
│   ├── seed.js                     # Master database seeder
│   ├── counselor-data.json         # Seeding dataset for counselors
│   ├── courses-complete-data.json  # Seeding dataset for courses & submodules
│   ├── admissions-data.json        # Seeding dataset for student admissions
│   ├── course-leads-data.json      # Seeding dataset for course leads
│   ├── personality-info.json       # Personality test settings
│   ├── personality-questions.json  # Personality test questions
│   └── personality-tab-results.json# Personality test score interpretations
├── public/
│   └── uploads/                    # Local asset fallbacks
├── src/
│   ├── app/                        # Next.js App Router (pages & API routes)
│   │   ├── api/                    # RESTful backend API endpoints
│   │   │   ├── admissions/         # Student admission endpoints
│   │   │   ├── alumni/             # Alumni management endpoints
│   │   │   ├── auth/               # Login, logout, session verification
│   │   │   ├── counsellors/        # Counselor directory endpoints
│   │   │   ├── courses/            # Course catalog endpoints
│   │   │   ├── dashboard/          # Aggregated dashboard metrics
│   │   │   ├── leads/              # Lead capture & bulk CSV intake
│   │   │   ├── personality-test/   # Assessment engine endpoints
│   │   │   ├── settings/           # Site settings & configuration
│   │   │   └── upload/             # Cloudinary upload handler
│   │   ├── counsellors/            # Counselor directory & edit views
│   │   ├── courses/                # Course catalog views
│   │   ├── leads/                  # Lead management views
│   │   ├── personality-test/       # Assessment configuration views
│   │   ├── profile/                # Admin credentials & profile settings
│   │   ├── settings/               # System & brand settings views
│   │   ├── login/                  # Admin authentication page
│   │   └── page.tsx                # Main Admin Analytics Dashboard
│   ├── components/                 # Modular React components
│   │   ├── dashboard/              # Dashboard widgets & charts
│   │   ├── layout/                 # Sidebar, header, navigation
│   │   ├── leads/                  # Lead tables & CSV import modals
│   │   ├── personality-test/       # Question & result tables
│   │   └── ui/                     # Reusable form controls & inputs
│   ├── lib/                        # Core utilities
│   │   ├── auth.ts                 # JWT signing, cookie verification, bcrypt
│   │   ├── cloudinary.ts           # Cloudinary SDK wrapper & upload utilities
│   │   ├── cors.ts                 # Cross-Origin Resource Sharing headers
│   │   ├── csvParser.ts            # CSV intake & normalization parser
│   │   └── prisma.ts               # Prisma client singleton
│   └── middleware.ts               # Route protection & CORS middleware
├── .env.example                    # Template for environment configuration
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

---

## ⚙️ Getting Started

### 1. Prerequisites

- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: PostgreSQL 14+ instance running locally or on a cloud provider (e.g., Supabase, Neon, AWS RDS)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/the-gold-technologies/admin-counselIndia.git
cd admin-counselIndia
npm install
```

### 3. Environment Configuration

Create a local `.env` file from the provided `.env.example` template:

```bash
cp .env.example .env
```

Open `.env` and fill in your actual values:

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/counselindia_cms"

# Application Server Configuration
PORT=3001
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_WEBSITE_URL="http://localhost:3000"

# Authentication & Security
JWT_SECRET="generate-a-strong-32-character-random-secret"
ADMIN_DEFAULT_EMAIL="admin@counselindia.com"
ADMIN_DEFAULT_PASSWORD="ChooseAStrongAdminPassword"
ADMIN_DEFAULT_PHONE="+91-XXXXXXXXXX"

# Cloudinary Asset Storage
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

> **Security Notice**: Never commit `.env` or any production secrets to GitHub. Ensure `.env` is listed in `.gitignore`.

### 4. Database Setup & Migrations

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Database

Populate your database with the initial dataset (Counselors, Courses, Submodules, Admissions, Settings, and Admin User):

```bash
npm run seed
```

### 6. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The admin portal will be available at: **[http://localhost:3001](http://localhost:3001)**

---

## 📜 Available Scripts

| Script            | Command                   | Purpose                                          |
| ----------------- | ------------------------- | ------------------------------------------------ |
| `dev`             | `npm run dev`             | Runs the Next.js development server on port 3001 |
| `build`           | `npm run build`           | Compiles the production bundle                   |
| `start`           | `npm run start`           | Runs the compiled production application         |
| `lint`            | `npm run lint`            | Runs ESLint checks                               |
| `format`          | `npm run format`          | Formats all code files using Prettier            |
| `format:check`    | `npm run format:check`    | Verifies code formatting conformance             |
| `prisma:generate` | `npm run prisma:generate` | Generates the Prisma Client types                |
| `prisma:push`     | `npm run prisma:push`     | Syncs schema changes to the PostgreSQL database  |
| `prisma:migrate`  | `npm run prisma:migrate`  | Creates and applies Prisma database migrations   |
| `seed`            | `npm run seed`            | Seeds PostgreSQL with all initial records        |

---

## 🔒 Security & Best Practices

1. **Environment Variables**:
   All sensitive credentials (database strings, JWT secrets, Cloudinary secrets, and admin passwords) are loaded strictly via `process.env`.
2. **Password Hashing**:
   All user passwords are encrypted using `bcryptjs` with salt rounds set to 10. Passwords are never stored or transmitted in plain text.
3. **Session Management**:
   Admin sessions use stateless JWT tokens verified inside Next.js edge middleware.
4. **Secret Remediation**:
   If credentials are ever exposed in previous commits, immediately rotate the affected password or API token at the identity provider level, and cleanse the repository history.

---

## 📄 License

This repository is proprietary and confidential to **Counsel India**. All rights reserved.
