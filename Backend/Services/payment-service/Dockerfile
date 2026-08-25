FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/payment-service/package.json ./Services/payment-service/

WORKDIR /app/Services/payment-service
RUN npm install

COPY ./Services/payment-service .

EXPOSE 3005

CMD ["npm", "start"]
