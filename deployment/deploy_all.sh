#!/usr/bin/env bash

FILES=()

DEFAULT_TTL="public,max-age=100"
DEBUG=false
DEFAULT_PROFILE="default"

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
    -p=*|--profile=*)
    PROFILE="${i#*=}"
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
if [[ -z $PROFILE ]]; then
  PROFILE=$DEFAULT_PROFILE
fi

echo "DEPLOYING USING PROFILE: $PROFILE"

# # add in the script folder
aws s3 cp ./build/static/js/ s3://$BUCKET/static/js/ --recursive --content-encoding "gzip" --cache-control $TTLINDEX --profile $PROFILE

# add in the css folder
aws s3 cp ./build/static/css/ s3://$BUCKET/static/css/ --recursive --content-encoding "gzip" --cache-control $TTLINDEX --profile $PROFILE

# add everything else
aws s3 cp ./build/ s3://$BUCKET/ --recursive --exclude "static/*" --cache-control $TTLINDEX --profile $PROFILE
