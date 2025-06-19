FROM node:22

WORKDIR /root/app

COPY . .

RUN npm ci

RUN npm run build

RUN npx tsc

EXPOSE 3000

WORKDIR /root/app/server/build

CMD [ "node", "index.js" ]