FROM node:18-alpine AS build

RUN apk update && apk add git

RUN mkdir -p /app

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY auth_config.json .

RUN npm install

COPY . .

RUN npm run dev

ENV SERVER_PORT=4200
ENV API_SERVER_PORT=3001

EXPOSE 4200
EXPOSE 3001

CMD ["npm", "run", "prod"]
