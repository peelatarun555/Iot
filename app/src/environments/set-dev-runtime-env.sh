#!/bin/sh
# Used for dev node environment

# Replace placeholders in runtime-env.template.js with actual environment variable values
envsubst "\$API_URL" < /app/src/environments/runtime-env.template.js > /app/src/environments/runtime-env.js

# Start frontend
npm start