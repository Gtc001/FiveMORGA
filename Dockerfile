FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production=false

COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install

COPY . .
RUN cd client && npm run build

RUN npm prune --production

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

CMD ["node", "server/index.js"]
