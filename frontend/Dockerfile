# Build stage
FROM node:18-slim AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG REACT_APP_API_URL=http://localhost:3001

# Build the React app with the API URL baked in
RUN npm run build

# Production stage
FROM node:18-slim

# Install serve to serve static files
RUN npm install -g serve

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "build", "-l", "3000"]
