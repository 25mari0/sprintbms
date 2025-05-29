# Use the official Node.js image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install curl for health-check
RUN apk add --no-cache curl

# Copy the rest of the application files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
