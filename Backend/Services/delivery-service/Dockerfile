FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/delivery-service/package.json ./Services/delivery-service/

WORKDIR /app/Services/delivery-service
RUN npm install

COPY ./Services/delivery-service .

EXPOSE 3008

CMD ["npm", "start"]
