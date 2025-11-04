FROM node:20-alpine
WORKDIR /usr/src/app

# Only copy package.json to leverage Docker layer caching
COPY package.json ./

# Conditional install: use npm ci if lockfile exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi


# Now copy the rest of the code
COPY . .

EXPOSE 9400
CMD ["node", "server.js"]
