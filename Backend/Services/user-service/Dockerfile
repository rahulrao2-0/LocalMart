FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/user-service/package.json ./Services/user-service/

WORKDIR /app/Services/user-service
RUN npm install

COPY ./Services/user-service .

EXPOSE 3002

CMD ["npm", "start"]
