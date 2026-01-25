#!/bin/bash
# Install Google Cloud SDK

# Download the archive
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-arm.tar.gz

# Extract the archive
tar -xf google-cloud-cli-darwin-arm.tar.gz

# Run the installation script
./google-cloud-sdk/install.sh --quiet --path-update true --bash-completion true --rc-path ~/.zshrc

# Cleanup
rm google-cloud-cli-darwin-arm.tar.gz
