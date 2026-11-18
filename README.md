# Simple & Secure Full-Stack Note-Taking App

A fundamentally sound, lightweight, and secure full-stack Note-Taking application built with Next.js (App Router), Node.js, Express, and PostgreSQL (hosted on Neon).

---

## 📌 Project Overview & Features

- **Authentication**: User signup and login powered by bcrypt for salted password hashing and stateless JWT (JSON Web Tokens).
- **Private Notes**: Complete CRUD functionality (Create, Read, Update, Delete) strictly isolated per user.
- **SQL Ownership Enforcement**: Ownership verification is enforced at the database query level (`WHERE id = $1 AND user_id = $2`), ensuring zero risk of horizontal privilege escalation.
- **Robust Validation**: Request bodies and parameters validated with Zod; returns clear 400 Bad Request error messages.
- **Centralized Error Handling**: Unified error response shape `{ "error": "message" }`, preventing stack trace leakage in production.
- **Security Hardened**: Protected with Helmet headers, scoped CORS configuration, and parameterized SQL queries to prevent SQL injection.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, JavaScript (ES6+), Tailwind CSS
- **Backend**: Node.js, Express.js (REST API)
- **Database**: PostgreSQL (Neon Serverless Postgres), `pg` library (raw SQL, no ORM)
- **Authentication**: `bcrypt` (password hashing), `jsonwebtoken` (JWT bearer authentication)
- **Validation**: `zod`
- **Security & Utilities**: `cors`, `helmet`, `dotenv`

---

## 📁 Folder Structure

```text
NoteTalkingApp/
├── client/                     # Next.js frontend application
│   ├── app/
│   │   ├── globals.css         # Tailwind CSS directives and baseline styling
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Root redirect (authenticated -> /notes, else -> /login)
│   │   ├── login/
│   │   │   └── page.js         # Login page with inline validation
│   │   ├── signup/
│   │   │   └── page.js         # Signup page with inline validation
│   │   └── notes/
│   │       └── page.js         # Notes dashboard (List, Add, Edit, Delete)
│   ├── components/
│   │   └── Navbar.js           # Navigation bar with user status and logout button
│   ├── lib/
│   │   └── api.js              # Centralized API fetch helper with JWT and 401 handling
│   ├── .env.example            # Client environment variable template
│   └── package.json
├── server/                     # Express REST API backend
│   ├── db/
│   │   ├── index.js            # Single pg Pool instance with Neon SSL configuration
│   │   ├── schema.sql          # PostgreSQL table schemas and indexes
│   │   └── migrate.js          # Migration runner script (`npm run migrate`)
│   ├── middleware/
│   │   ├── async.middleware.js # Async error wrapper utility
│   │   ├── auth.middleware.js  # JWT Bearer token authentication middleware
│   │   ├── error.middleware.js # Central error handler and 404 handler
│   │   └── validate.middleware.js # Zod body and params validation middleware
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth routes (signup, login)
│   │   └── notes.routes.js     # /api/notes routes (CRUD)
│   ├── validators/
│   │   ├── auth.validator.js   # Zod schemas for signup and login
│   │   └── note.validator.js   # Zod schemas for note payload and UUID params
│   ├── .env.example            # Server environment variable template
│   ├── index.js                # Express app entrypoint and server listener
│   └── package.json
└── README.md
```

---

## 🚀 Local Setup Step-by-Step

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- A free **Neon PostgreSQL** database account ([https://neon.tech](https://neon.tech))

### 2. Set Up Neon PostgreSQL
1. Sign up / log in to [Neon](https://neon.tech).
2. Create a new project (e.g., `notetaking-db`).
3. Copy your connection string from the Neon dashboard (ensure `sslmode=require` is present). It looks like:
   ```text
   postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
   ```

### 3. Configure Server Environment Variables
Navigate to `/server` and create a `.env` file from the example:
```bash
cd server
cp .env.example .env
```
Fill in the values in `server/.env`:
```env
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
JWT_SECRET=replace_with_a_secure_random_string_min_32_chars
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 4. Run Database Migration
Inside `/server`, execute the migration script to create tables and indexes:
```bash
npm run migrate
```
You should see:
```text
Running database migrations...
Migrations completed successfully.
```

### 5. Start the Backend API
From the `/server` directory:
```bash
# Production mode
npm start

# Or development mode with auto-reload
npm run dev
```
The server will start on `http://localhost:5000`. Test the health check endpoint:
```bash
curl http://localhost:5000/health
# {"status":"ok"}
```

### 6. Configure Client Environment Variables
Open a new terminal, navigate to `/client`, and create `.env.local`:
```bash
cd client
cp .env.example .env.local
```
Ensure `client/.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 7. Start the Frontend App
From the `/client` directory:
```bash
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Auth Required | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/health` | No | Server health check | `200` |
| `POST` | `/api/auth/signup` | No | Create user account & return JWT | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | No | Authenticate user & return JWT | `200`, `400`, `401` |
| `GET` | `/api/notes` | Yes | List notes for authenticated user | `200`, `401` |
| `POST` | `/api/notes` | Yes | Create note linked to `req.user.id` | `201`, `400`, `401` |
| `GET` | `/api/notes/:id` | Yes | Get single note by ID (only if owned) | `200`, `400`, `401`, `404` |
| `PUT` | `/api/notes/:id` | Yes | Update note by ID (only if owned) | `200`, `400`, `401`, `404` |
| `DELETE`| `/api/notes/:id` | Yes | Delete note by ID (only if owned) | `200`, `400`, `401`, `404` |

---

## 🔒 Security Decisions

1. **Password Hashing**: Passwords are hashed with `bcrypt` (10 salt rounds) before entering the database. Hashes are irreversible and plain passwords are never stored or logged.
2. **Never Exposing Passwords**: Passwords and password hashes are explicitly omitted from all database SELECT/RETURNING clauses in responses.
3. **Ownership Enforced in SQL**:
   - Ownership is verified directly inside SQL queries (`WHERE id = $1 AND user_id = $2`), never by fetching the note and doing an in-memory check in JavaScript.
   - If no row matches, a `404 Not Found` is returned. This prevents ID enumeration; another user's note is completely indistinguishable from a non-existent note.
4. **Untrusted Client Inputs**:
   - `user_id` is extracted strictly from the verified JWT payload (`req.user.id`), never from request headers or body parameters.
   - All SQL queries use parameterized placeholders (`$1`, `$2`, etc.) to prevent SQL injection.
5. **Generic Auth Errors**: Both nonexistent email and incorrect password return the same generic message: `"Invalid credentials"`, preventing account enumeration.
6. **Central Error Handler**: Stack traces and internal DB messages are suppressed. Only clean, consistent error objects `{ "error": "message" }` reach clients.
7. **HTTP Security Headers & CORS**: `helmet` is enabled for defensive HTTP response headers, and CORS is locked down to `CLIENT_URL`.

---

## 🌐 Deployment Steps

### Backend Deployment (Render)
1. Push code to GitHub.
2. Log in to [Render](https://render.com) and click **New Web Service**.
3. Connect your repository and set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Neon connection string (with `?sslmode=require`)
   - `JWT_SECRET`: A secure 32+ character random string
   - `PORT`: `10000` (or leave default, Render sets `PORT` automatically)
   - `CLIENT_URL`: Your deployed frontend URL (e.g., `https://your-app.vercel.app`)
5. Click **Deploy**. Note your backend URL (e.g., `https://your-api.onrender.com`).
6. Run migrations on the remote Neon database either locally with the Neon connection string (`npm run migrate`) or via Render's shell.

### Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Select your repository.
3. In project settings:
   - **Root Directory**: Edit and set to `client`
   - **Framework Preset**: Next.js
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g., `https://your-api.onrender.com`)
5. Click **Deploy**.

### Live Links Placeholder
- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend API (Render)**: `https://your-api.onrender.com`
