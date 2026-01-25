#!/bin/bash
# Script to refresh Stitch MCP access token

GCLOUD_BIN="$(pwd)/google-cloud-sdk/bin/gcloud"

if [ ! -f "$GCLOUD_BIN" ]; then
    echo "Error: gcloud not found at $GCLOUD_BIN"
    exit 1
fi

# Get the current project ID
PROJECT_ID=$($GCLOUD_BIN config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    # Default to user-provided ID if it was set during installation
    PROJECT_ID="ai-designer-stitch"
    $GCLOUD_BIN config set project $PROJECT_ID --quiet
fi

echo "Using Project ID: $PROJECT_ID"

# Refresh the token
echo "Refreshing access token..."
TOKEN=$($GCLOUD_BIN auth application-default print-access-token 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "Error: Failed to get access token. Please run 'gcloud auth application-default login' first."
    exit 1
fi

# Update .env file
echo "GOOGLE_CLOUD_PROJECT=$PROJECT_ID" > .env
echo "STITCH_ACCESS_TOKEN=$TOKEN" >> .env

echo "Successfully updated .env with new access token."
echo "Note: Tokens expire every hour."
