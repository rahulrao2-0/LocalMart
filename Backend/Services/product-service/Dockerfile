FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/product-service/package.json ./Services/product-service/

WORKDIR /app/Services/product-service
RUN npm install

COPY ./Services/product-service .

EXPOSE 3003

CMD ["npm", "start"]
