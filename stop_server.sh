#!/bin/bash
source ~/.bashrc

cd $(dirname $0)
pm2 stop npm
exit 0