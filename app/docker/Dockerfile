# Build stage
FROM node:22-alpine as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .
COPY tsconfig*.json .

# Install Python, Make, and G++ for building dependencies
# Then clear the cache to keep the image size down
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# Install npm packages
RUN npm install

# Copy the source code
COPY ./src ./src
COPY ./angular.json ./angular.json

# Build the application for production
RUN npm run build -- --configuration production

# Production stage
FROM nginx:1.25 as production-stage

# Copy the built application from the build stage to Nginx's serve directory
COPY --from=build-stage /app/dist/angular-frontend/browser /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Copy util scripts
COPY ./src/environments/runtime-env.template.js /utils/runtime-env.template.js
COPY ./src/environments/set-prod-runtime-env.sh /utils/set-prod-runtime-env.sh

# Grant permissions to bash file
RUN chmod +rwx /utils/set-prod-runtime-env.sh

# Set the entrypoint to the production shell script - starting nginx
ENTRYPOINT ["/utils/set-prod-runtime-env.sh"]
