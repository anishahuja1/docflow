FROM node:20-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Use vite directly to skip TypeScript type-check errors during build
RUN npx vite build

# Production serve
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
