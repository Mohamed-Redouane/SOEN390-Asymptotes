# ====== FRONTEND STAGE ====== 
FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Define build arguments
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_SECRET
ARG VITE_GOOGLE_CLIENT_ID

# Expose those arguments to the frontend build environment
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_SECRET=${VITE_GOOGLE_CLIENT_SECRET}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

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
