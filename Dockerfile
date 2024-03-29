# Use Node 16 alpine as parent image
FROM node:18.6.0-alpine3.16

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of project files into this image
COPY . .

# Expose application port
EXPOSE 3200

# Start the application
CMD npm start
