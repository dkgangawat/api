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
yum remove -y nodejs
yum autoremove
rm -rf ./node_modules

# Node JS Install
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
yum install -y nodejs

# Install dependencies
npm install -g forever
npm install -g pm2
npm install