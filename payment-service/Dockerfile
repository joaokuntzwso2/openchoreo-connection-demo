FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY src ./src

ENV PORT=7070

EXPOSE 7070

CMD ["npm", "start"]