# ThoughtWeb Navigator — Frontend

React + TypeScript + Vite client for ThoughtWeb Navigator. Communicates with the FastAPI backend (see `../backend_fastapi/`).

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure the backend URL:

   ```sh
   cp .env.example .env
   ```

   `VITE_API_URL` defaults to `http://127.0.0.1:8000/api/v1`.

3. Run the dev server:

   ```sh
   npm run dev
   ```

   Open [http://localhost:8080](http://localhost:8080).

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Layout

```
src/
├── components/   # Feature + shadcn/ui components
├── context/      # React context providers (Auth, App, Theme)
├── hooks/        # Custom hooks
├── lib/          # API client and utilities
└── pages/        # Route pages
```

For the full application quick start, see the [root README](../README.md).