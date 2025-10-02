# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Make port 3000 available
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "index.js" ]