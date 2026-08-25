FROM node:18-alpine

WORKDIR /app

COPY ./shared ./shared
COPY ./Services/auth-service/package.json ./Services/auth-service/

WORKDIR /app/Services/auth-service
RUN npm install

COPY ./Services/auth-service .

EXPOSE 3001

CMD ["npm", "start"]
