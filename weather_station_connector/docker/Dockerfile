# Stage 1: Building the application

# Use the lightweight version of Node 22
FROM node:22-alpine as build-stage

# Set the working directory in the container to /app
WORKDIR /app

# Copy tsconfig.json and package*.json files into the working directory
COPY package*.json .
COPY tsconfig.json .

# Copy the source code into the /app/src directory in the container
COPY ./src ./src

# Install npm packages
RUN npm install

# Build the application
RUN npm run build

# Remove test folder
RUN rm -f -r public/test

# Stage 2: Setting up the production environment

# Use the lightweight version of Node 22
FROM node:22-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install npm packages
RUN npm install

# Copy the built application from the build stage
COPY --from=build-stage /app/public ./public

# Define the command to run the application
CMD ["node", "./public/runner.js"]
