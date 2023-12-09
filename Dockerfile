FROM playwright/chrome:playwright-1.40.1
CMD ["yarn", "start"]
USER root
ENV HOME /root
EXPOSE 3000
SHELL ["/bin/bash", "-c"]

WORKDIR /root
RUN apt-get remove -y nodejs npm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN . $HOME/.nvm/nvm.sh && nvm install 18.16.0 \
    && npm install -g yarn

# COPY ./.yarn/plugins /app/.yarn/plugins
# COPY ./.yarn/releases /app/.yarn/releases
# COPY ./dist /app/dist
# COPY ./srv /app/srv
# COPY ./.yarnrc.yml /app/
# COPY ./package.json /app/
# COPY ./yarn.lock /app/
COPY . /app
WORKDIR /app
RUN . $HOME/.nvm/nvm.sh \
    && yarn install && yarn cache clean
ENV SHELL /bin/bash
ENTRYPOINT []
