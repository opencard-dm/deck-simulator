FROM node:18.16.0-alpine3.18
USER root
ENV HOME /root

WORKDIR /app
COPY ./.yarn /app/.yarn
COPY ./.yarnrc.yml /app/
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN yarn install && yarn cache clean

ENTRYPOINT []
CMD yarn start --port $PORT

COPY . /app
