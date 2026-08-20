<<<<<<< HEAD
# Task Management App

A full-stack task management application built for a 2–3 day take-home assignment.

## Stack

- Backend: NestJS, MongoDB/Mongoose, JWT, Passport, class-validator
- Frontend: Next.js App Router, React Query, TypeScript
- Email: Nodemailer (SMTP; works with SendGrid/Resend SMTP or any SMTP provider)
- Files: Cloudinary
- Weather: OpenWeatherMap
- Deployment target: Vercel (frontend) + Render/Railway/Fly.io (backend)

## Features

- User registration/login with JWT
- Private tasks: a user can only access their own tasks
- Full CRUD for tasks
- Task fields: title, description, status, priority, due date, location, attachments
- Pagination, sorting and filtering by status, priority and due-date range
- Cloudinary file/image upload
- Task-created confirmation email
- Task-done notification email
- Live OpenWeatherMap weather for task location
- Protected frontend routes
- React Query server state
- Loading, error and empty states
- Centralized backend exception handling
- DTO validation
- Basic security headers, password hashing and ownership checks

## Project structure

```text
task-management-app/
  backend/
    src/
      auth/
      tasks/
      users/
      weather/
      mail/
      common/
      app.module.ts
      main.ts
    .env.example
    package.json
  frontend/
    app/
      dashboard/
      login/
      register/
      tasks/[id]/
      layout.tsx
      page.tsx
      providers.tsx
    components/
    lib/
    types/
    .env.example
    package.json
  README.md
```

## 1. Backend setup

Requirements:
- Node.js 20+
- MongoDB (local or Atlas)
- Cloudinary account
- OpenWeatherMap API key
- SMTP credentials

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Backend runs on `http://localhost:4000`.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Environment variables

### Backend

See `backend/.env.example`.

Important values:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `OPENWEATHER_API_KEY`

For SendGrid or Resend, use their SMTP credentials or adapt `MailService` to their official SDK.

### Frontend

- `NEXT_PUBLIC_API_URL`

## API

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Tasks

- `GET /tasks?page=1&limit=10&status=TODO&priority=HIGH&dueFrom=2026-01-01&dueTo=2026-12-31&sortBy=createdAt&sortOrder=desc`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/attachments`
- `DELETE /tasks/:id/attachments/:attachmentId`
- `GET /tasks/:id/weather`

All task routes require `Authorization: Bearer <jwt>`.

## Example create-task payload

```json
{
  "title": "Inspect outdoor equipment",
  "description": "Check the equipment before the field visit.",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-08-25",
  "location": "Bengaluru"
}
```

## Architecture notes

### Authentication/security
Passwords are hashed with bcrypt. JWTs are signed by the backend and protected routes use a Passport JWT guard. Task queries always include the authenticated user's ID, preventing users from reading/updating/deleting another user's task.

### Data modeling
MongoDB uses separate `User` and `Task` collections. `Task.userId` is an ObjectId reference to `User`. Attachments are embedded in the task because they are tightly coupled to task lifecycle and are stored as Cloudinary URLs.

### Third-party integrations
- Email is isolated behind `MailService`.
- Cloudinary upload logic is isolated in `CloudinaryService`.
- Weather is isolated in `WeatherService`.
This keeps integrations replaceable and makes the task service easier to test.

### State management
React Query owns server state. The auth token is stored in localStorage for this assignment and sent as a Bearer token. For a production system, an HttpOnly, Secure, SameSite cookie-based session/token strategy would be preferable.

## Trade-offs / what I would improve

Given the 2–3 day constraint:
1. Use JWT in localStorage for simplicity; production would use HttpOnly cookies plus CSRF protection where appropriate.
2. Weather is fetched on demand instead of continuously polling every task.
3. Attachments are uploaded directly through the backend to keep the client simple; production could use signed direct-to-cloud uploads.
4. MongoDB was chosen for fast iteration and simple embedded attachment modeling.
5. More time would go into automated unit/e2e tests, rate limiting, refresh-token rotation, background job processing for email, signed download URLs, stronger observability and CI/CD.

## Deployment

### Backend
Deploy `backend/` to Render/Railway/Fly.io.

Set the same environment variables from `backend/.env.example`. Set:
`FRONTEND_URL=https://YOUR-VERCEL-DOMAIN`

### Frontend
Deploy `frontend/` to Vercel and set:
`NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN`

## Git hygiene

Suggested commits:

```text
feat: initialize NestJS API and MongoDB models
feat: add JWT authentication
feat: add private task CRUD and filtering
feat: add Cloudinary attachments
feat: add email notifications
feat: add OpenWeatherMap integration
feat: add Next.js dashboard
chore: add deployment and environment documentation
```

Do not commit `.env`, credentials, API keys or uploaded files.
=======
# task-management-system
>>>>>>> 4dcba5ad2b732766c5b4b1fa865b79bb69815af5
