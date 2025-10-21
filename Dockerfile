#
# STAGE 1: The "Factory" - Build the app
#
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies) for building
RUN pnpm install --frozen-lockfile

# Copy the rest of your source code
COPY . .

# Build the application
# This will also create the .next/standalone folder
RUN pnpm run build

#
# STAGE 2: The "Final Product" - Run the app
#
FROM node:20-alpine AS runner

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Set environment to production
ENV NODE_ENV=production

# Copy the minimal package manifests
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the standalone output from the "builder" stage
# This copies the server.js and .next folder to the /app directory
COPY --from=builder /app/.next/standalone ./

# Copy the static assets (CSS, JS chunks, etc.)
# This goes *inside* the .next folder
COPY --from=builder /app/.next/static ./.next/static

# Copy the public folder (images, fonts, etc.)
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# The command to run the production server
# Now we run "server.js" directly from the /app directory
CMD ["node", "server.js"]