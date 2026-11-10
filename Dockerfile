FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server ./server
COPY website ./website

ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/nexora.sqlite

EXPOSE 8080

CMD ["node", "server/server.js"]
