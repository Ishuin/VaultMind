# ============================================================
# Stage 1 — Builder (Node.js + npm install + Vite build)
# Purpose: Install npm dependencies and compile the React app
# into static files. Node.js is not needed at runtime for a
# Vite SPA — only the compiled /dist output is.
# ============================================================
FROM node:20-alpine AS builder

# Set the working directory inside the builder container.
WORKDIR /app

# Copy package manifests first (before source code) so that the
# "npm ci" layer is cached and only re-runs when dependencies change.
# package-lock.json ensures deterministic, reproducible installs.
COPY package.json package-lock.json ./

# npm ci (clean install) is preferred over npm install in CI/CD and Docker builds:
#   - Installs exactly what's in package-lock.json (no version resolution drift)
#   - Removes node_modules and reinstalls from scratch
#   - Faster and more predictable than npm install
RUN npm ci

# Copy all remaining source files into the container.
# Done after npm ci so source changes don't invalidate the dependency cache.
COPY . .

# Build the production bundle.
# Vite outputs optimised, minified static assets to the /app/dist directory.
# The VITE_API_URL build argument lets CI/CD or docker-compose inject the
# backend URL at build time (Vite embeds it into the JS bundle via import.meta.env).
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# ============================================================
# Stage 2 — Runtime (Nginx serves the static bundle)
# Purpose: A minimal Nginx image to serve the pre-built dist/.
# The entire Node.js toolchain is discarded; only ~23 MB Nginx
# and the compiled HTML/JS/CSS files remain.
# ============================================================
FROM nginx:alpine AS runtime

# Remove the default Nginx welcome-page configuration so our
# custom config is the only one loaded.
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config that handles SPA routing.
# React Router uses client-side routing; without this config Nginx
# would return 404 for any URL that isn't literally a file on disk.
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy the compiled static assets from the builder stage into Nginx's
# default web root. Nginx will serve these files for every request.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 — the default Nginx HTTP port.
# docker-compose maps this to the host via the "ports" section.
EXPOSE 80

# The default Nginx CMD starts the server in the foreground.
# "daemon off" prevents Nginx from forking to the background,
# which is required for Docker to keep the container alive.
CMD ["nginx", "-g", "daemon off;"]
