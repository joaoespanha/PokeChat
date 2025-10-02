# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the Vite port
EXPOSE 5173

# Run the development server
CMD ["npm", "run", "dev", "--", "--host"]