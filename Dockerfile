FROM playwright/chrome:playwright-1.40.1
USER root
ENV HOME /root
EXPOSE 8080
SHELL ["/bin/bash", "-c"]

WORKDIR /root
RUN apt-get remove -y nodejs npm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN . $HOME/.nvm/nvm.sh && nvm install 18.16.0 \
    && npm install -g yarn

WORKDIR /app
COPY ./.yarn /app/.yarn
COPY ./.yarnrc.yml /app/
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN . $HOME/.nvm/nvm.sh \
    && yarn install && yarn cache clean

ENV SHELL /bin/bash
ENTRYPOINT []
CMD bash -c ". ~/.nvm/nvm.sh && yarn start --port ${PORT}"

COPY . /app
