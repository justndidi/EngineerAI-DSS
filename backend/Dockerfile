FROM node:24-bookworm

# Install LibreOffice and required runtime packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libreoffice \
        libreoffice-calc \
        fonts-liberation \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Backend working directory
WORKDIR /app

# Copy package files first for Docker caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend application
COPY . .

# Railway will provide PORT
EXPOSE 5000

# Start Express
CMD ["npm", "start"]