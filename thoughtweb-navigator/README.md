# ThoughtWeb Navigator

This project is a web application built using Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node.js)

### Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/AttivAI/thoughtweb-navigator.git 
    ```
    (Or your specific fork/clone URL)

2.  **Navigate to the project directory:**
    ```sh
    cd thoughtweb-navigator
    ```

3.  **Install dependencies:**
    ```sh
    npm i
    ```

### Running the Development Server

To start the development server with auto-reloading:

```sh
npm run dev
```

This will typically start the server on `http://localhost:8080`.

### Building for Production

To create a production build:

```sh
npm run build
```
The output files will be in the `dist` directory.

### Previewing the Production Build

To preview the production build locally:

```sh
npm run preview
```

## Key Technologies

-   **Vite:** Fast build tool and development server.
-   **React:** JavaScript library for building user interfaces.
-   **TypeScript:** Superset of JavaScript that adds static typing.
-   **shadcn-ui:** Re-usable UI components.
-   **Tailwind CSS:** Utility-first CSS framework.
-   **Supabase:** Backend-as-a-Service for database, auth, and more.
-   **Lucide React:** Icon library.
-   **React Router DOM:** For client-side routing.
-   **React Hook Form & Zod:** For form handling and validation.
-   **TanStack Query (React Query):** For server-state management.

## Project Structure

-   `public/`: Static assets.
-   `src/`: Source code.
    -   `components/`: Reusable UI components.
        -   `layout/`: Layout components (e.g., MainLayout).
        -   `ui/`: Base UI elements from shadcn-ui.
    -   `context/`: React context providers.
    -   `hooks/`: Custom React hooks.
    -   `lib/`: Utility functions and library configurations (e.g., Supabase client, cn utility).
    -   `pages/`: Page components for different routes.
    -   `App.tsx`: Main application component, sets up routing.
    -   `main.tsx`: Entry point of the application.
    -   `index.css`: Global styles and Tailwind directives.
-   `supabase/`: Supabase specific configurations and edge functions.
-   `tailwind.config.js`: Tailwind CSS configuration.
-   `vite.config.ts`: Vite configuration.
-   `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript configurations.
-   `package.json`: Project metadata and dependencies.
-   `.env.example`: Example environment variables (copy to `.env` and fill in your actual secrets).

## Environment Variables

Create a `.env` file in the root of the `thoughtweb-navigator` directory by copying `.env.example`. This file is used to store your Supabase URL and anon key, and any other secrets.

Example `.env` content:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Note:** The `.env` file is included in `.gitignore` and should not be committed to the repository.
