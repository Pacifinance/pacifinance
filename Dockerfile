# Base image
FROM node:24.13-alpine AS base
WORKDIR /usr/src/pacifinance
COPY package*.json .
RUN npm ci
COPY . .

# Image for building react
FROM base AS react-builder
WORKDIR /usr/src/pacifinance
RUN npm run build

# Image for building typescript
FROM base AS ts-builder
WORKDIR /usr/src/pacifinance
RUN npx tsc

# Production image
FROM node:24.13-alpine AS runner
WORKDIR /usr/src/pacifinance
COPY package*.json .
RUN npm ci --omit=dev
COPY --from=react-builder /usr/src/pacifinance/build ./build
COPY --from=ts-builder /usr/src/pacifinance/server/build ./server/build
EXPOSE 3000
WORKDIR /usr/src/pacifinance/server/build
CMD [ "node", "index.js" ]