FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/order-service/package.json ./Services/order-service/

WORKDIR /app/Services/order-service
RUN npm install

COPY ./Services/order-service .

EXPOSE 3004

CMD ["npm", "start"]
