FROM node:18 AS build

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build

WORKDIR /app/web
COPY web/package.json web/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY web .
RUN yarn run build

FROM node:18-alpine
WORKDIR /app

# Install dotenvx
RUN curl -fsS https://dotenvx.sh/ | sh

COPY .env ./

COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend
COPY --from=build /app/web/build ./web/build
COPY --from=build /app/package.json ./

RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 3000
CMD yarn run start