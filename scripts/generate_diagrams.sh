#!/bin/bash

# Script to generate diagrams from PlantUML files
# Usage:
#   ./scripts/generate_diagrams.sh                  - Generate all diagrams
#   ./scripts/generate_diagrams.sh filename         - Generate specific diagram
#   ./scripts/generate_diagrams.sh type             - Generate all diagrams of a type
#   ./scripts/generate_diagrams.sh type/filename    - Generate specific diagram of a type

# Check if PlantUML jar exists, if not download it
PLANTUML_JAR="plantuml.jar"
if [ ! -f "$PLANTUML_JAR" ]; then
    echo "Downloading PlantUML jar..."
    curl -L -o "$PLANTUML_JAR" "https://sourceforge.net/projects/plantuml/files/plantuml.jar/download"
fi

# Create output directory if it doesn't exist
mkdir -p docs/assets/diagrams/images

# Base directories
PUML_BASE_DIR="docs/assets/diagrams/puml"
IMAGE_BASE_DIR="docs/assets/diagrams/images"

# Available diagram types
DIAGRAM_TYPES=("architecture" "usecase" "sequence" "activity" "class" "erd")

# Function to generate a specific diagram
generate_diagram() {
    local file=$1
    local filename=$(basename "$file" .puml)
    echo "Generating diagram: $filename"
    java -jar "$PLANTUML_JAR" "$file" -o "$IMAGE_BASE_DIR"
}

# Function to check if a string is in an array
contains_element() {
    local e match="$1"
    shift
    for e; do [[ "$e" == "$match" ]] && return 0; done
    return 1
}

# Check if a specific file or type was provided
if [ $# -eq 1 ]; then
    # Check if it's a type
    if contains_element "$1" "${DIAGRAM_TYPES[@]}"; then
        # Generate all diagrams of this type
        echo "Generating all $1 diagrams..."
        for file in "$PUML_BASE_DIR/$1"/*.puml; do
            generate_diagram "$file"
        done
    # Check if it's a type/filename
    elif [[ $1 == */* ]]; then
        type=$(echo "$1" | cut -d'/' -f1)
        filename=$(echo "$1" | cut -d'/' -f2)

        if contains_element "$type" "${DIAGRAM_TYPES[@]}"; then
            # Check if filename has .puml extension
            if [[ $filename == *.puml ]]; then
                # Full filename provided
                if [ -f "$PUML_BASE_DIR/$type/$filename" ]; then
                    generate_diagram "$PUML_BASE_DIR/$type/$filename"
                else
                    echo "Error: File $PUML_BASE_DIR/$type/$filename not found"
                    exit 1
                fi
            else
                # Only base filename provided
                if [ -f "$PUML_BASE_DIR/$type/$filename.puml" ]; then
                    generate_diagram "$PUML_BASE_DIR/$type/$filename.puml"
                else
                    echo "Error: File $PUML_BASE_DIR/$type/$filename.puml not found"
                    exit 1
                fi
            fi
        else
            echo "Error: Invalid diagram type '$type'. Available types: ${DIAGRAM_TYPES[*]}"
            exit 1
        fi
    else
        # Try to find the file in any type directory
        found=false
        for type in "${DIAGRAM_TYPES[@]}"; do
            # Check with .puml extension
            if [[ $1 == *.puml ]]; then
                if [ -f "$PUML_BASE_DIR/$type/$1" ]; then
                    generate_diagram "$PUML_BASE_DIR/$type/$1"
                    found=true
                    break
                fi
            else
                # Check without .puml extension
                if [ -f "$PUML_BASE_DIR/$type/$1.puml" ]; then
                    generate_diagram "$PUML_BASE_DIR/$type/$1.puml"
                    found=true
                    break
                fi
            fi
        done

        if [ "$found" = false ]; then
            echo "Error: File $1 not found in any diagram type directory"
            echo "Available types: ${DIAGRAM_TYPES[*]}"
            exit 1
        fi
    fi
else
    # Generate all diagrams
    echo "Generating all diagrams..."
    for type in "${DIAGRAM_TYPES[@]}"; do
        if [ -d "$PUML_BASE_DIR/$type" ]; then
            for file in "$PUML_BASE_DIR/$type"/*.puml; do
                # Check if the file exists (to handle empty directories)
                if [ -f "$file" ]; then
                    generate_diagram "$file"
                fi
            done
        fi
    done
fi

echo "Diagrams generated successfully!"
