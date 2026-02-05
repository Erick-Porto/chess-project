# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

RUN npm rebuild esbuild && npx quasar prepare

EXPOSE 9000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]