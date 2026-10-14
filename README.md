# Connectly — Full-stack social platform

React 19 + Vite 8 + Tailwind/CSS frontend; Express 5 backend; persistent SQLite database using Node's built-in SQLite driver. Existing burgundy/rose UI and feed filtering are preserved.

## Requirements

Node.js 22.13+ (Node 24 recommended) and pnpm. Internet is needed for dependency installation, Google Fonts and external demo images. SQLite requires no separate database installation. Node may print an experimental SQLite warning on some releases.

## Quick start — one server

Extract this ZIP and open a terminal inside Connectly-Fullstack:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open http://localhost:3001. The server serves the built frontend and API together. SQLite is automatically created at server/data/connectly.sqlite and seeded only when the users table is empty. Restarting does not reset data.

## Development — two terminals

Terminal 1:
```sh
pnpm server
```

Terminal 2:
```sh
pnpm dev
```

Open the Vite URL printed in terminal 2. Vite proxies /api requests to port 3001. Use the same frontend origin throughout a session. If you change the backend port, update the proxy in vite.config.ts too.

## Accounts

- hafsa@example.com / Demo1234!
- marcus@example.com / Build1234!
- sofia@example.com / Design1234!

Demo shortcuts perform normal credential login; there is no backend login-by-user-ID bypass. Other fictional seeded profiles have randomly generated inaccessible passwords. Newly registered users can log out and sign in with their own password.

Demo credentials are public sample credentials. Disable seeding with SEED_DEMO=false on a fresh database when using your own accounts; this does not remove existing seeded users. The frontend demo shortcuts remain visible unless removed. Do not reuse real passwords for public demos.

## Persistence and security

- Separate users, posts, comments, likes, follows and sessions tables with foreign keys and unique constraints.
- Salted scrypt password hashes; plaintext passwords are not stored.
- Random server-side sessions; only hashed session tokens are stored in SQLite.
- HttpOnly, SameSite cookies; sessions expire after seven days and are invalidated on logout.
- Ownership and author identity enforced by the backend, independent of supplied IDs.
- Server validation, login/register rate limiting, cross-origin request rejection, image limits and safe profile URL checks.
- Post deletion cascades to comments and likes.
- Other users' email addresses are omitted from API profile data.
- Previous localStorage demo data is neither imported nor deleted. The API database is now the source of truth.

## Configuration

Optional: copy .env.example to .env and adjust PORT, DB_PATH, SEED_DEMO or APP_ORIGIN. Never commit .env or server/data/. NODE_ENV=production enables Secure session cookies: production requires HTTPS. APP_ORIGIN should be the exact public HTTPS origin behind a reverse proxy. The server binds to loopback; configure a reverse proxy or deliberately adjust the host for hosting.

## API

The frontend service preserves the original method signatures and uses JSON action endpoints:

POST /api/actions/:action
Body: {"args": [...]}
Success: {"result": ...}
Failure: {"error": "..."}

Actions: login, register, logout, getSnapshot, getCurrentUser, getUsers, getUserProfile, updateProfile, getPosts, createPost, updatePost, deletePost, getComments, addComment, deleteComment, toggleLike, followUser, unfollowUser, getFollowers and getFollowing.

GET /api/health is a health check. Protected operations require a valid session. getSnapshot returns an empty logged-out snapshot before sign-in. Snapshots currently load all content; add pagination for larger deployments.

## Verification

```sh
pnpm test
pnpm build
```

Three tests pass: two feed tests plus an API integration test covering registration/login, duplicate accounts, unauthorized operations, ownership, empty content validation, comments/likes, unique follows, database/server restart persistence, cascade deletion, session invalidation, and cross-origin rejection. The production frontend build passes. Browser visual testing was not repeated during this backend integration.

## Scope

Suitable for a local assignment/demo. No email verification, password reset, pagination, distributed rate limiter or managed image storage is included. Images uploaded by the existing frontend are validated raster data URLs stored in SQLite (roughly 5MB per image). Remote images are not downloaded by the server. Back up the database before changes; use SQLite's backup facility or stop the server before copying its files. Do not delete the database to fix login problems.

Source, tests, lockfile and configuration are included. node_modules, generated dist and personal databases are excluded. Build before pnpm start.
