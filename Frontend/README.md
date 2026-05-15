# Frontend

Smart Study Workspace frontend is a Next.js + TypeScript app with a calm, minimal UI inspired by knowledge-first tools.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide icons

## Pages
- `/` landing page
- `/login` auth page
- `/register` auth page
- `/dashboard` workspace shell
- `/profile` account overview

## Environment
Create a `.env.local` file in this folder when connecting to the backend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Run

```bash
npm install
npm run dev
```

## Notes
- Auth forms already call the backend login/register endpoints.
- The dashboard is currently a polished shell with mock data and is ready to be wired to real API responses.
- Realtime messages are prepared for websocket integration later in the same visual system.
