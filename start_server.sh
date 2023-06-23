#!/bin/bash
source ~/.bashrc

cd $(dirname $0)
pm2 start npm --name "agrijod-backend" -- run watch