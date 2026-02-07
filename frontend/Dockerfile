FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npm rebuild esbuild && npx quasar prepare

EXPOSE 9000

CMD ["npx", "quasar", "dev", "--host", "0.0.0.0", "--port", "9000"]