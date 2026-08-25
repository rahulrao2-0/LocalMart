FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/cart-service/package.json ./Services/cart-service/

WORKDIR /app/Services/cart-service
RUN npm install

COPY ./Services/cart-service .

EXPOSE 3006

CMD ["npm", "start"]
