# Use Debian-based Node.js image (NOT Alpine) to avoid fontconfig issues
FROM node:18-slim

# Install necessary system dependencies and fonts for meme generation
RUN apt-get update && apt-get install -y \
    libvips-dev \
    fonts-liberation \
    fontconfig \
    fonts-dejavu-core \
    fonts-freefont-ttf \
    && fc-cache -f -v \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
