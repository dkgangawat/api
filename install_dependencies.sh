#!/bin/bash
source ~/.bashrc

cd $(dirname $0)

# Add environment variables to a .env file
rm -f ./.env
echo "MONGO_URI=$MONGO_URI" >> ./.env
echo "JWT_SECRET_KEY=$JWT_SECRET_KEY" >> ./.env

# Node JS Install
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
yum install -y nodejs

# Install dependencies
npm install -g forever
npm install -g pm2
npm install