FROM node:20-alpine

LABEL maintainer="777"
LABEL project="devkitz"
LABEL component="nanobot-swarm"

# Python fuer hybride Tasks
RUN apk add --no-cache python3 py3-pip curl

WORKDIR /app

# Dependencies
COPY package.json ./
RUN npm install --production --silent

# Bot Code
COPY . .

EXPOSE 3099

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3099/status || exit 1

CMD ["node", "swarm-spawner.js"]
