#!/bin/sh
# Used for production node environment

# Create the environments directory if it doesn't exist
mkdir -p /usr/share/nginx/html/environments

# Replace placeholders in runtime-env.template.js with actual environment variable values
envsubst "\$API_URL" < /utils/runtime-env.template.js > /usr/share/nginx/html/environments/runtime-env.js

# Start Nginx
nginx -g 'daemon off;'