# 🔌 Garuda Electricals & Hardwares

> A complete full-stack web application for electrical and hardware retail business with public website and admin panel.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?style=flat&logo=tailwind-css)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Configuration](#-configuration)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Admin Credentials](#-admin-credentials)
- [Business Information](#-business-information)

---

## 🌟 Overview

Garuda Electricals & Hardwares is a comprehensive web solution designed for local electrical and hardware retail businesses. It features a customer-facing website for product browsing and a powerful admin panel for business management including invoicing, customer management, and inventory control.

---

## ✨ Features

### 🌐 Public Website
| Feature | Description |
|---------|-------------|
| **Home Page** | Hero section, featured products, categories, statistics, offers |
| **About Page** | Company story, milestones, values, team info |
| **Products** | Category filtering, search, detailed product pages |
| **Offers** | Active promotions and discounts |
| **Contact** | Contact form, Google Maps, WhatsApp integration |

### 🔐 Admin Panel
| Feature | Description |
|---------|-------------|
| **Dashboard** | Revenue stats, charts, recent orders, top products |
| **Products** | Full CRUD, image upload, featured toggle, categories |
| **Categories** | Manage product categories with icons |
| **Customers** | Customer database with contact info |
| **Invoices** | Create invoices, add line items, payment tracking |
| **PDF Generation** | Download professional PDF invoices |
| **WhatsApp Integration** | Share invoices via WhatsApp with item list |
| **Offers** | Create and manage promotional offers |
| **Settings** | Update business contact details site-wide |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router |
| **Backend** | FastAPI, Python 3.9+, Pydantic |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | JWT with bcrypt password hashing |
| **PDF Generation** | ReportLab |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐   │
│  │   Frontend   │      │   Backend    │      │     Database         │   │
│  │   (React)    │◄────►│  (FastAPI)   │◄────►│    (Supabase)        │   │
│  │   Vercel     │      │   Render     │      │   PostgreSQL         │   │
│  └──────────────┘      └──────────────┘      └──────────────────────┘   │
│         │                     │                        │                 │
│         ▼                     ▼                        ▼                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐   │
│  │ Public Pages │      │  REST APIs   │      │      Tables          │   │
│  │ - Home       │      │ - Auth       │      │ - users              │   │
│  │ - About      │      │ - Products   │      │ - categories         │   │
│  │ - Products   │      │ - Categories │      │ - products           │   │
│  │ - Offers     │      │ - Customers  │      │ - customers          │   │
│  │ - Contact    │      │ - Invoices   │      │ - invoices           │   │
│  ├──────────────┤      │ - Offers     │      │ - invoice_items      │   │
│  │ Admin Panel  │      │ - Dashboard  │      │ - offers             │   │
│  │ - Dashboard  │      │ - Settings   │      │ - contact_messages   │   │
│  │ - Products   │      │ - PDF Gen    │      │ - settings           │   │
│  │ - Invoices   │      └──────────────┘      └──────────────────────┘   │
│  │ - Settings   │                                                        │
│  └──────────────┘                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
garuda-electricals/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Supabase connection
│   │   ├── routers/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── products.py      # Product CRUD
│   │   │   ├── categories.py    # Category management
│   │   │   ├── customers.py     # Customer management
│   │   │   ├── invoices.py      # Invoice & PDF generation
│   │   │   ├── offers.py        # Offers/promotions
│   │   │   ├── dashboard.py     # Dashboard stats
│   │   │   ├── contact.py       # Contact form
│   │   │   └── settings.py      # Site settings
│   │   └── utils/
│   │       ├── auth.py          # JWT utilities
│   │       └── pdf_generator.py # PDF invoice generator
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml              # Render deployment config
│
├── frontend/
│   ├── public/
│   │   └── logo.png             # Business logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── layouts/
│   │   ├── pages/
│   │   │   ├── public/          # Home, About, Products, Contact
│   │   │   └── admin/           # Dashboard, Products, Invoices, etc.
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Authentication state
│   │   │   └── SettingsContext.jsx # Site settings state
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json              # Vercel deployment config
│   └── .env.example
│
├── database/
│   ├── schema.sql               # Complete database schema
│   └── 05_settings.sql          # Settings table
│
├── .gitignore
└── README.md
```

---

## 💻 Installation

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher
- **npm** or **yarn**
- **Supabase** account (free tier works)

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/garuda-electricals.git
cd garuda-electricals
```

---

## 🗄 Database Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be provisioned

2. **Run the Schema**
   - Go to **SQL Editor** in Supabase dashboard
   - Copy contents of `database/schema.sql` and run it
   - Copy contents of `database/05_settings.sql` and run it

3. **Get Your Credentials**
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

---

## ⚙ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Garuda Electricals & Hardwares
VITE_WHATSAPP_NUMBER=919489114403
```

---

## 🚀 Running Locally

### Quick Start (All-in-One)

```bash
# Clone and navigate to project
git clone <repo-url>
cd garuda-electricals

# Setup backend
cd backend
python -m venv venv
# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend (in new terminal)
cd ../frontend
npm install
```

### Option 1: Run Backend & Frontend Separately

#### Start Backend

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

**Backend will be available at:**
- App: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### Start Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

### Option 2: Run Both Concurrently

#### Windows (PowerShell)

```powershell
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Linux/Mac

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 3: Using npm-run-all (Concurrent from Root)

Install concurrently package (optional):
```bash
npm install -g concurrently
```

Then create a root script and run both from project root.

### Verify Everything Works

1. **Check Backend API:**
   - Visit: `http://localhost:8000/docs`
   - You should see Swagger UI with all API endpoints

2. **Check Frontend:**
   - Visit: `http://localhost:5173`
   - You should see the Garuda Electricals website

3. **Test Authentication:**
   - Go to Admin Panel in frontend
   - Login with credentials:
     - Email: `Garudaelectrical@gmail.com`
     - Password: `admin123`

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | `uvicorn app.main:app --reload --port 8001` |
| Port 5173 already in use | `npm run dev -- --port 5174` |
| Module not found (backend) | Ensure venv is activated: `source venv/bin/activate` |
| npm ERR (frontend) | Delete `node_modules` and `package-lock.json`, then run `npm install` |
| CORS errors | Check `.env` CORS_ORIGINS matches your frontend URL |
| Database connection issues | Verify `.env` has correct Supabase credentials |

### Stop Development Servers

- **Backend:** Press `Ctrl + C` in backend terminal
- **Frontend:** Press `Ctrl + C` in frontend terminal

---

## 🌐 Deployment

### Backend on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `garuda-electricals-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

4. Add Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SECRET_KEY`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
   - `CORS_ORIGINS` = `https://your-app.vercel.app`

5. Deploy and copy the URL

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add Environment Variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_WHATSAPP_NUMBER` = `919489114403`

5. Deploy!

### Post-Deployment

Update CORS on Render after getting your Vercel URL:
```
CORS_ORIGINS=https://garuda-electricals.vercel.app
```

---

## 📚 API Documentation

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Admin login |
| `/api/auth/me` | GET | ✅ | Get current user |

### Products
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/products` | GET | ❌ | List all products |
| `/api/products/{slug}` | GET | ❌ | Get product by slug |
| `/api/products/featured` | GET | ❌ | Get featured products |
| `/api/products` | POST | ✅ | Create product |
| `/api/products/{id}` | PUT | ✅ | Update product |
| `/api/products/{id}` | DELETE | ✅ | Delete product |

### Categories
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/categories` | GET | ❌ | List all categories |
| `/api/categories` | POST | ✅ | Create category |
| `/api/categories/{id}` | PUT | ✅ | Update category |
| `/api/categories/{id}` | DELETE | ✅ | Delete category |

### Customers
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/customers` | GET | ✅ | List all customers |
| `/api/customers` | POST | ✅ | Create customer |
| `/api/customers/{id}` | PUT | ✅ | Update customer |
| `/api/customers/{id}` | DELETE | ✅ | Delete customer |

### Invoices
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/invoices` | GET | ✅ | List all invoices |
| `/api/invoices` | POST | ✅ | Create invoice |
| `/api/invoices/{id}` | GET | ✅ | Get invoice details |
| `/api/invoices/{id}` | PUT | ✅ | Update invoice |
| `/api/invoices/{id}/pdf` | GET | ✅ | Download PDF |
| `/api/invoices/{id}/whatsapp` | GET | ✅ | Get WhatsApp link |

### Dashboard
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/dashboard/stats` | GET | ✅ | Get dashboard statistics |
| `/api/dashboard/monthly-revenue` | GET | ✅ | Get monthly revenue data |

### Settings
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/settings` | GET | ❌ | Get all settings |
| `/api/settings` | PUT | ✅ | Update settings |

---

## 🔐 Admin Credentials

| Email | Password |
|-------|----------|
| `Garudaelectrical@gmail.com` | `admin123` |

⚠️ **Change these credentials after first login in production!**

---

## 🏢 Business Information

**Garuda Electricals & Hardwares**

| Detail | Value |
|--------|-------|
| **Address** | No 51/1, Near Trichy Main Road, Gandhigramam, Karur-639004 |
| **Phone** | +91 94891 14403 |
| **Email** | Garudaelectrical@gmail.com |
| **GST** | 33BLPPS4603G1Z0 |
| **Hours** | Monday - Saturday: 9:00 AM - 8:00 PM |

---

## 📄 License

This project is developed for **Garuda Electricals & Hardwares**.

---

## 🤝 Support

For issues or questions, contact: **Garudaelectrical@gmail.com**
