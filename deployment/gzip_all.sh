#!/usr/bin/env bash

gzip -r ./build/static/js
gzip -r ./build/static/css

for filename in ./build/static/css/*.gz; do
  newfilename=${filename::-3}
  mv "$filename" "$newfilename"
done

for filename in ./build/static/js/*.gz; do
  newfilename=${filename::-3}
  mv "$filename" "$newfilename"
done

echo 'done'

