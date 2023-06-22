#!/bin/bash
source ~/.bashrc

cd $(dirname $0)

# Add environment variables to a .env file
rm -f ./.env
echo "MONGO_URI=$MONGO_URI" >> ./.env
echo "JWT_SECRET_KEY=$JWT_SECRET_KEY" >> ./.env

# Clean up
rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node*
rm -rf /usr/local/bin/node*
rm -rf /usr/local/include/node*
rm -rf ./node_modules
yum remove -y nodejs npm
yum -y autoremove
yum -y clean all

# Node JS and NPM installation
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
chmod +x ~/.nvm/nvm.sh
source ~/.nvm/nvm.sh
nvm install 16
node -e "console.log('Running Node.js ' + process.version)"

# Install dependencies
npm install
npm install pm2 -g
