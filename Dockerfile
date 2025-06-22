# Base image
FROM node:22 AS base
WORKDIR /usr/src/pacifinance
COPY package*.json .
RUN npm ci
COPY . .

# Image for building react
FROM base AS react-builder
WORKDIR /usr/src/pacifinance
RUN npm run build

# Image for building typescript
FROM react-builder AS ts-builder
WORKDIR /usr/src/pacifinance
RUN npx tsc

# Production image
FROM node:22
WORKDIR /usr/src/pacifinance
COPY package*.json .
RUN npm ci --production
COPY --from=ts-builder /usr/src/pacifinance/build ./build
COPY --from=ts-builder /usr/src/pacifinance/server/build ./server/build
EXPOSE 3000
WORKDIR /usr/src/pacifinance/server/build
CMD [ "node", "index.js" ]