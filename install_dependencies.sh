#!/bin/bash
source ~/.bashrc

cd $(dirname $0)

# Add environment variables to a .env file
rm -f ./.env
echo "MONGO_URI=$MONGO_URI" >> ./.env
echo "JWT_SECRET_KEY=$JWT_SECRET_KEY" >> ./.env

# Clean up
rm -rf node_modules
rm -f package-lock.json

# Node JS and NPM installation
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
chmod +x ~/.nvm/nvm.sh
source ~/.nvm/nvm.sh
nvm install 16
node -e "console.log('Running Node.js ' + process.version)"

# Install dependencies
npm install
npm install pm2 -g