FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/notification-service/package.json ./Services/notification-service/

WORKDIR /app/Services/notification-service
RUN npm install

COPY ./Services/notification-service .

EXPOSE 3009

CMD ["npm", "start"]
