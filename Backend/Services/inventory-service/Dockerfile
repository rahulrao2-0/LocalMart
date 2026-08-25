FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/inventory-service/package.json ./Services/inventory-service/

WORKDIR /app/Services/inventory-service
RUN npm install

COPY ./Services/inventory-service .

EXPOSE 3007

CMD ["npm", "start"]
