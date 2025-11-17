#!/bin/bash
echo "Copying files from GenZSmart directory to public directory"
mkdir -p public
cp -r GenZSmart/* public/
