# Use Node.js as the base image
FROM node:23.9-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
# CMD ["serve", "-s", "build", "-l", "3000"]