#!/bin/sh

zip -r build.zip src/ public/ package-lock.json package.json

scp build.zip root@192.168.78.100:/root/app/app.zip

ssh root@192.168.78.100 "cd app && unzip -o app.zip"
ssh root@192.168.78.100 "cd app && rm -rf app.zip"


ssh root@192.168.78.100 "systemctl restart local-server.service"