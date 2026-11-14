FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SPRING_URL
ARG VITE_FASTAPI_URL
ENV VITE_SPRING_URL=$VITE_SPRING_URL VITE_FASTAPI_URL=$VITE_FASTAPI_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
