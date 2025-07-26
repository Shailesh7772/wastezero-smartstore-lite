#!/bin/bash

# Build the project
npm run build

# Deploy to Netlify (if netlify-cli is installed)
if command -v netlify &> /dev/null; then
    netlify deploy --prod --dir=dist
else
    echo "Netlify CLI not found. Please install with: npm install -g netlify-cli"
    echo "Or deploy manually by uploading the 'dist' folder to Netlify"
fi 