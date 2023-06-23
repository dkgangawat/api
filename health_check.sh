#!/bin/bash
source ~/.bashrc

cd $(dirname $0)
sleep 10
# Health check and exit with an error if response is not 200
if [ $(curl -s -I -o /dev/null -w '%{http_code}' http://localhost:8000/actuator/health/deep) != "200" ];
then
    echo "Health check failed"
    exit 1
else
    echo "Health check passed"
    exit 0
fi