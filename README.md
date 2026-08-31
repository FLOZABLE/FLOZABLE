# Flozable v1 — Legacy Backend

> [!IMPORTANT]
> This repository contains the backend for the **original version of Flozable**, developed from 2023–2025.
>
> Flozable v1 grew to approximately **300 users** before this architecture was retired.
> In 2026, Flozable was relaunched with a new product direction and a significantly simpler **Next.js + Supabase** architecture.
>
> The project itself is still active at [flozable.com](https://flozable.com).

## About Flozable v1

Flozable v1 was a full-stack productivity platform focused on studying, planning, accountability, and social productivity.

The original platform included features such as:

- User authentication and accounts
- Subjects and study tracking
- Study plans
- Groups and group membership
- Friends
- Real-time chat
- Notifications
- Rankings and leaderboards
- Themes and customization
- Website usage tracking
- Companion mobile applications

The platform reached approximately **300 users** before the original infrastructure was retired.

## Architecture

The original Flozable backend was built as a standalone TypeScript API.

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

### Data

- MySQL / MariaDB
- Redis for caching and session-related workflows

### Real-Time

- Socket.IO

### Infrastructure

- Originally deployed using AWS
- Background jobs and scheduled tasks handled within the Node.js backend

## Project Structure

```text
src/
├── config/
├── controllers/
├── libs/
├── middlewares/
├── models/
├── prisma/
├── queries/
├── routes/
├── schedulers/
├── schemas/
├── services/
├── sockets/
└── types/
```

## Major API Areas

```text
/auth
/account
/subject
/ranking
/group
/plan
/friend
/notification
/chat
/theme
/user
/extension
```

## What I Worked On

As the founder and primary developer of Flozable, I worked across the product and infrastructure, including:

- Designing and implementing backend APIs
- Building caching and session workflows with Redis
- Designing relational application data with SQL and Prisma
- Building authentication and account systems
- Implementing recurring subscription workflows with Stripe
- Developing real-time and social features
- Synchronizing application data across web and mobile clients
- Deploying and maintaining the original production infrastructure

## Why v1 Was Retired

As Flozable evolved, the infrastructure required to operate the original architecture became unnecessarily complex and expensive for the project's needs.

Rather than continuing to maintain separate application servers, databases, caching infrastructure, and deployment resources, I decided to rebuild Flozable around a simpler architecture.

## Flozable Relaunch

Flozable was relaunched in **2026** with:

- Next.js
- Supabase

The relaunch also introduced a new product direction.

The goal of the migration was to reduce infrastructure complexity and operating costs while making the product easier to iterate on.

**Current product:** [flozable.com](https://flozable.com)

---

## Running the Legacy Backend

### Requirements

- Node.js
- npm
- MySQL / MariaDB
- Redis

### Installation

```bash
git clone https://github.com/FLOZABLE/FLOZABLE.git
cd FLOZABLE
npm install
```

Create a `.env` file based on `.env.template`, then generate the Prisma client:

```bash
npm run prisma:generate
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

---

## Status

**Archived architecture / reference implementation.**

This repository is preserved as the original backend codebase behind Flozable v1 and as a record of the engineering work that powered the first version of the product.

Active development has moved to the relaunched Flozable architecture.

---

Built by [Jason Lee](https://github.com/dIwnsgml).
