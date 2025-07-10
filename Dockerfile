# Build Stage
FROM node:20-alpine as builder
LABEL authors="havokz"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src .

RUN npm run builder

# Production Stage
FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html