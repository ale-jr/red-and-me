#!/bin/sh

zip -r build.zip src/ public/ package-lock.json package.json

scp build.zip root@192.168.201.100:/root/app/app.zip

ssh root@192.168.201.100 "cd app && unzip -o app.zip"
ssh root@192.168.201.100 "cd app && rm -rf app.zip"

if [ "$1" == "--npm-install" ]; then
    ssh root@192.168.201.100 "cd app && npm i"
fi

ssh root@192.168.201.100 "systemctl restart project.service"