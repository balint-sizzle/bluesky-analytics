# Use Node.js as the base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build for production
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# # Start the application
# CMD ["serve", "-s", "build", "-l", "3000"]

For development, you can use this instead:
CMD ["npm", "start"]