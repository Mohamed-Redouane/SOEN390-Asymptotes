# ====== FRONTEND STAGE ======
FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# We'll pass in a single ARG from Railway
ARG GOOGLE_MAPS_API_KEY

# Expose that ARG to the frontend build with a VITE_ prefix
ENV VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

COPY frontend ./
RUN npm run build

# ====== BACKEND STAGE ======
FROM node:18-alpine AS backend

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend ./

# Copy frontend build output into backend's dist folder
COPY --from=frontend-builder /app/dist ./dist

# Now also expose the same key to the backend environment
ENV GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

# Other environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV CLIENT_URL=${CLIENT_URL}

# Compile backend if needed
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
