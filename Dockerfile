FROM node:18 AS build
RUN yarn config set registry https://registry.npmjs.org
#https://registry.npmmirror.com

COPY . /app

#RUN yarn config set registry https://mirrors.cloud.tencent.com/npm/


WORKDIR /app
RUN yarn install && yarn run build --no-audit

WORKDIR /app/web
RUN yarn config set registry https://registry.npmjs.org
RUN yarn install && yarn run build --no-audit

FROM node:18-alpine
WORKDIR /app

# Install dotenvx
RUN curl -fsS https://dotenvx.sh/ | sh

COPY .env /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend
COPY --from=build /app/web/build ./web/build
COPY --from=build /app/package.json ./

RUN yarn config set registry https://registry.npmjs.org
RUN yarn install --production --no-audit&& yarn cache clean

EXPOSE 3000
CMD yarn run start