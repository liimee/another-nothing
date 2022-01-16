# syntax=docker/dockerfile:1

FROM fedora:35
RUN dnf install ruby ruby-devel rubygem-bundler sqlite nodejs bcrypt gcc libstdc++ g++ sqlite-devel -y
RUN corepack enable
WORKDIR /app
COPY . .
RUN mkdir ./data
VOLUME ./data
RUN yarn
RUN bundle
EXPOSE 3000
ENTRYPOINT yarn idk
