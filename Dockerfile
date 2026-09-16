FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY scripts ./scripts
COPY public ./public
COPY content ./content
COPY data ./data
COPY docs/evidence ./docs/evidence
ARG RELEASE_MODE=preview
ARG SITE_ORIGIN
RUN RELEASE_MODE="$RELEASE_MODE" SITE_ORIGIN="$SITE_ORIGIN" node scripts/build.mjs
FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "src/server.mjs"]
