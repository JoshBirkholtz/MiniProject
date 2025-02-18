#!/bin/bash

# Exit on error
set -e

# Build frontend
cd client
npm install --include=dev
npm run build
cd ..

# Build backend
cd server
npm install