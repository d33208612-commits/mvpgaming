# ---- Stage 1: build the React frontend ----
FROM node:22-slim AS web
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# ---- Stage 2: server + built frontend ----
FROM node:22-slim
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=web /app/web/dist /app/web/dist

ENV NODE_ENV=production \
    ALLOW_DEV_AUTH=0 \
    PORT=3001 \
    DB_PATH=/app/server/data/app.db
EXPOSE 3001
CMD ["node", "src/index.js"]
