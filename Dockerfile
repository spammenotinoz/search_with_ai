FROM node:18 AS build
RUN npm config set registry https://registry.npmjs.org

COPY . /app

WORKDIR /app
RUN npm install && npm run build

WORKDIR /app/web
RUN npm config set registry https://registry.npmjs.org
RUN npm install && npm run build

FROM node:18-alpine
WORKDIR /app

# Install dotenvx
RUN curl -fsS https://dotenvx.sh/ | sh

COPY .env /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend
COPY --from=build /app/web/build ./web/build
COPY --from=build /app/package.json ./

RUN npm config set registry https://registry.npmjs.org
RUN npm install --production && npm cache clean --force

EXPOSE 3000
CMD npm start