FROM nginxinc/nginx-unprivileged:1.26-alpine AS base
WORKDIR /app
EXPOSE 8080

FROM node:22-alpine AS build
WORKDIR /build

COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

COPY .env .env
COPY . .

RUN npm run build

FROM base AS final
COPY --from=build /build/dist /usr/share/nginx/html
COPY --from=build /build/nginx/nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
CMD ["nginx", "-g", "daemon off;"]
