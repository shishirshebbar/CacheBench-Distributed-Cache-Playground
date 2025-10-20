FROM node:20-alpine
WORKDIR /usr/src/app

# Only copy package.json to leverage Docker layer caching
COPY package.json ./

# Use npm install (no lockfile required)
RUN npm install --omit=dev --no-audit --no-fund

# Now copy the rest
COPY . .

EXPOSE 9400
CMD ["node", "server.js"]
