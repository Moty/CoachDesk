#!/bin/bash

# Firebase Deployment Script for HelpDesk
# This script automates the deployment process to Firebase

set -e

echo "🚀 Starting Firebase deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
fi

# Ensure we're logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase login:list &> /dev/null; then
    echo "Please log in to Firebase:"
    firebase login
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Run typechecks
echo "✅ Running type checks..."
npm run typecheck

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy Firestore rules
echo "📋 Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "🔍 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Deploy Cloud Functions or Cloud Run
echo "☁️  Deploying API (Functions/Cloud Run)..."
firebase deploy --only functions

# Deploy hosting configuration (if applicable)
echo "🌐 Deploying hosting configuration..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo ""
echo "📝 Post-deployment checklist:"
echo "  1. Verify environment variables in Firebase Console"
echo "  2. Check Cloud Functions logs for any startup errors"
echo "  3. Test critical endpoints"
echo "  4. Verify Firestore security rules are active"
echo ""
echo "🔗 Access your deployed app:"
firebase hosting:channel:list
