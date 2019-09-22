#!/usr/bin/env bash

FILES=()

DEFAULT_TTL="public,max-age=100"
DEBUG=false

# get command line arguments
for i in "$@"
do
case $i in
    -b=*|--bucket=*)
    BUCKET="${i#*=}"
    shift # past argument=value
    ;;
    -t=*|--ttl=*)
    TTLINDEX="${i#*=}"
    shift # past argument=value
    ;;
    -d=*|--debug=*)
    DEBUG=true
    shift
    ;;
    *)
    FILES[$ind]=$i
    ind=$((ind+1))
          # unknown option
    ;;
esac
done

if [ -z $TTLINDEX ]; then
  TTLINDEX=$DEFAULT_TTL
fi

# # add in the script folder
aws s3 cp ./build/static/js/ s3://$BUCKET/static/js/ --recursive --content-encoding "gzip" --cache-control $TTLINDEX

# add in the css folder
aws s3 cp ./build/static/css/ s3://$BUCKET/static/css/ --recursive --content-encoding "gzip" --cache-control $TTLINDEX

# add everything else
aws s3 cp ./build/ s3://$BUCKET/ --recursive --exclude "static/*" --cache-control $TTLINDEX