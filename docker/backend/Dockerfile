FROM node:20.2.0-alpine
WORKDIR /src/app
COPY ./backend .
RUN npm ci
CMD ["npm", "start"]