#!/bin/bash

echo "Building project for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "Build successful. Deploying to Firebase..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "Deployment successful!"
        echo "Your site is live at: https://socialpickle.co"
    else
        echo "Deployment failed!"
        exit 1
    fi
else
    echo "Build failed!"
    exit 1
fi