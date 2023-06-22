#!/bin/bash
source ~/.bashrc

cd $(dirname $0)
pm2 stop npm
pm2 start npm -- start