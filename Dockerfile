FROM node:18-slim

# Install dependencies and Chrome
RUN apt-get update && apt-get install -y wget gnupg ca-certificates     && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -     && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list     && apt-get update && apt-get install -y google-chrome-stable     && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set workdir and copy files
WORKDIR /app
COPY . .

# Install Node dependencies
RUN npm install

# Expose port and start server
EXPOSE 3000
CMD ["node", "server.mjs"]
