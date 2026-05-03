<div align="center">

# ⚖️ CaseRoute

### AI-Powered Legal Marketplace & Case Management

*Streamlining the connection between clients and legal professionals through intelligent structuring and secure communication.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🌿 Overview

**CaseRoute** is a full-stack legal technology platform designed to eliminate the friction in finding legal representation. By leveraging a simulated AI document structuring architecture, the application parses client case descriptions to automatically generate categorizations and assess urgency — putting the right lawyer in front of the right client, faster.

The platform bridges the gap between clients and legal professionals through three core pillars:

- **Intelligent Matching** — Asymptotic algorithmic ranking of lawyers by specialization, experience, and availability.
- **Secure Document Vault** — A high-capacity evidence hub for uploading, viewing, and managing sensitive legal files.
- **Real-Time Communication** — A live chat environment powered by Socket.io for immediate client-lawyer collaboration.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Registration** | Users can seamlessly sign up as Clients, Lawyers, or Admins, with secure Bcrypt hashing and automatic redirection to customized dashboards. |
| ⚖️ **Smart Case Submission** | Simulated AI logic analyzes case descriptions and automatically assigns legal categories and urgency flags. |
| 🛡️ **Secure Document Vault** | High-capacity evidence hub for uploading (up to 50MB Base64), viewing, and deleting sensitive legal documents. |
| 🔄 **Algorithmic Matchmaking** | Dynamic ranking of lawyer profiles based on specialization, experience, and current case load. |
| 💬 **Collaborative Workspace** | Real-time communication powered by Socket.io, featuring persistent message history between client and assigned lawyer. |
| 📊 **Real-Time Timeline** | Visual roadmap tracking case progress from submission through lawyer assignment to evidence readiness. |
| 🔒 **Role-Based Access** | Strict routing and fully customized dashboards for Clients, Lawyers, and System Admins. |

---

## 🏗️ System Architecture

CaseRoute follows a decoupled **Client-Server** architecture optimized for real-time state management:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Database      │
│   (Next.js)     │     │   (Express)     │     │   (PostgreSQL)  │
│                 │◀────│                 │◀────│                 │
│ • Role UI       │     │ • Match Logic   │     │ • User Profiles │
│ • Vault Access  │     │ • Vault API     │     │ • Documents     │
│ • Live Chat     │     │ • Socket.io     │     │ • Chat History  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   AI Layer      │
                        │  (Mock Logic)   │
                        │ • Categorize    │
                        │ • Urgency Flags │
                        └─────────────────┘
```

- **Frontend (Next.js):** Handles role-based UI rendering, file uploads to the vault, and the dynamic case timeline via Tailwind CSS.
- **Backend (Express):** Performs request validation, orchestrates the matchmaking algorithm, and manages WebSocket connections.
- **AI Layer (Mock Service):** Utilizes asynchronous delays and structured JSON stubs to simulate external AI processing without API overhead.
- **Database (PostgreSQL via Neon):** Stores user metadata, raw case details, and manages relational data through Prisma ORM.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Real-Time** | Socket.io |
| **Database** | PostgreSQL, Prisma ORM |
| **State Management** | Zustand |
| **Icons** | Lucide-React |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🗄️ Database Schema

The application uses a relational schema fully managed by Prisma ORM:

```sql
-- Core Tables Representation

CREATE TABLE "User" (
    "id"       SERIAL PRIMARY KEY,
    "name"     TEXT NOT NULL,
    "email"    TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role"     ENUM ('USER', 'LAWYER', 'ADMIN')
);

CREATE TABLE "Case" (
    "id"          SERIAL PRIMARY KEY,
    "title"       TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status"      ENUM ('PENDING', 'ASSIGNED', 'RESOLVED'),
    "clientId"    INTEGER REFERENCES "User"("id"),
    "lawyerId"    INTEGER REFERENCES "User"("id")
);

CREATE TABLE "Document" (
    "id"       SERIAL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileData" TEXT NOT NULL,   -- Base64 encoded string
    "caseId"   INTEGER REFERENCES "Case"("id")
);

CREATE TABLE "Message" (
    "id"       SERIAL PRIMARY KEY,
    "text"     TEXT NOT NULL,
    "caseId"   INTEGER REFERENCES "Case"("id"),
    "senderId" INTEGER REFERENCES "User"("id")
);
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed before running the project:

- [Node.js](https://nodejs.org/) (v18+)
- A running [PostgreSQL](https://www.postgresql.org/) database instance

### Installation

**1. Clone the Repository**

```bash
git clone https://github.com/ZainAbbas-dev/caseroute.git
cd caseroute
```

**2. Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file inside the `/backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/caseroute"
JWT_SECRET="your_secret_key"
PORT=5000
```

Run Prisma migrations and start the development server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

**3. Frontend Setup**

```bash
cd ../frontend
npm install
npm run dev
```

The application will be live at **http://localhost:3000**.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
|`POST` |	`/api/auth/register` |	Creates a new account, hashes the password, and assigns a user role |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT with role information |
| `POST` | `/api/cases` | Submits a new case and triggers the simulated AI structuring pipeline |
| `GET` | `/api/cases/:id/documents` | Fetches all secure vault documents for a specific case |
| `POST` | `/api/cases/:id/documents` | Uploads a Base64-encoded document payload to the vault |
| `GET` | `/api/match/:id` | Returns the algorithmically sorted list of best-fit lawyers for a case |

---

## 📸 Screenshots

| Screen | Preview |
|---|---|
| Sign Up Screen | ![Sign Up Screen](./screenshots/signup.png) |
| Login Screen | ![Login Screen](./screenshots/login.png) |
| Client Dashboard | ![Client Dashboard](./screenshots/client-dashboard.png) |
| New Case Submission | ![New Case Submission](./screenshots/new-case.png) |
| Case Details & Timeline | ![Case Details](./screenshots/case-details.png) |
| Lawyer Dashboard | ![Lawyer Dashboard](./screenshots/lawyer-dashboard.png) |
| Lawyer Profile | ![Lawyer Profile](./screenshots/lawyer-profile.png) |
| Live Chat Environment | ![Live Chat](./screenshots/live-chat.png) |
| Admin Dashboard | ![Admin Dashboard](./screenshots/admin-dashboard.png) |

## 🔮 Future Enhancements

- 🧠 **Live AI Integration** — Replace the mock architecture with live OpenAI or Gemini endpoints for advanced NLP-powered document summarization and case analysis.
- 💳 **Payment Gateway** — Stripe integration for processing legal consultation fees securely.
- 📹 **Video Consultations** — WebRTC implementation for secure, in-browser video meetings between clients and lawyers.
- 📧 **Notification System** — Email and in-app alerts for case status changes, new messages, and lawyer assignments.
- 🌍 **Multi-language Support** — Localization for broader accessibility across different jurisdictions.

---

## 👨‍💻 Author

**Muhammad Zain Abbas**

> *Computer Science Student · Full Stack Developer & Aspiring Machine Learning Engineer*
>
> Passionate about building robust, practical software solutions that prioritize structural correctness and intelligent algorithmic design.

📧 [iamzainabbass@gmail.com](mailto:iamzainabbass@gmail.com)
🐙 [GitHub](https://github.com/ZainAbbas-dev)

---

<div align="center">

*If you found this project useful, consider giving it a ⭐ on GitHub!*

</div>
