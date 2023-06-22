#!/bin/bash
source ~/.bashrc
cd $(dirname $0)

# Stop npm scripts
pm2 stop "agrijod-backend"
pm2 delete "agrijod-backend"

# Remove pm2
npm uninstall pm2 -g

# Clean up
rm -rf node_modules
rm -f package-lock.json

# Remove environment variables
rm -f .env

# Remove nvm
rm -rf ~/.nvm
exit 0