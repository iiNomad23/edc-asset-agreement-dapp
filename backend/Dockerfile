FROM node:22.19-alpine AS base
WORKDIR /app
EXPOSE 8190

FROM node:22.19-alpine AS build
WORKDIR /build
COPY . .
RUN npm ci --ignore-scripts
RUN npm run build

FROM base AS final
COPY --from=build /build/dist ./dist
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/package.json ./package.json
USER node
CMD ["npm", "start"]