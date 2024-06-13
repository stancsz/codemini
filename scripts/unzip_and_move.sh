#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <search_path> <destination_folder>"
  exit 1
fi

SEARCH_PATH=$1
DESTINATION_FOLDER=$2

# Find the mini-*.zip file
ZIP_FILE=$(find "$SEARCH_PATH" -name 'mini-*.zip' | head -n 1)

if [ -z "$ZIP_FILE" ]; then
  echo "No matching zip file found in $SEARCH_PATH"
  exit 1
fi

# Unzip the file directly to the destination folder, overwriting existing files
unzip -o "$ZIP_FILE" -d "$DESTINATION_FOLDER"

# Clean up
rm "$ZIP_FILE"

echo "Successfully unzipped and moved files from $ZIP_FILE to $DESTINATION_FOLDER"
