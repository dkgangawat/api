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
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
yum install -y nodejs npm

# Install dependencies
npm install -g forever
npm install -g pm2
npm install