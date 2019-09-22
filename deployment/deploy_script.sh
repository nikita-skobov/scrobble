#!/bin/bash

npm run build
./deployment/gzip_all.sh
aws s3 rm s3://$1 --recursive
./deployment/deploy_all.sh --bucket=$1 --ttl=public,max-age=40
