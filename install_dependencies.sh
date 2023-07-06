#!/bin/bash
source ~/.bashrc

cd $(dirname $0)

# Add environment variables to a .env file
export MONGO_URI="$(aws ssm get-parameter --name MONGO_URI --query "Parameter.Value" --output text)"
export JWT_SECRET_KEY="$(aws ssm get-parameter --name JWT_SECRET_KEY --query "Parameter.Value" --output text)"
export GOOGLE_MAP_KEY="$(aws ssm get-parameter --name GOOGLE_MAP_KEY --query "Parameter.Value" --output text)"
echo "MONGO_URI='$MONGO_URI'" >> .env
echo "JWT_SECRET_KEY='$JWT_SECRET_KEY'" >> .env
echo "GOOGLE_MAP_KEY='$GOOGLE_MAP_KEY'" >> .env

# Node JS and NPM installation
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
chmod +x ~/.nvm/nvm.sh
source ~/.nvm/nvm.sh
nvm install 16
node -e "console.log('Running Node.js ' + process.version)"

# Install dependencies
npm install
npm install pm2 -g