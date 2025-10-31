#!/bin/bash

# Script to create a new todo project using the golden path template
# This simulates what the Backstage template would do

set -e

# Default values
PROJECT_NAME=""
DESCRIPTION=""
FEATURE_TYPE="feature"
FEATURE_DESCRIPTION=""

# Function to display usage
usage() {
    echo "Usage: $0 -n PROJECT_NAME [-d DESCRIPTION] [-t FEATURE_TYPE] [-f FEATURE_DESCRIPTION]"
    echo ""
    echo "Options:"
    echo "  -n PROJECT_NAME        Name of the project (required)"
    echo "  -d DESCRIPTION         Description of the project"
    echo "  -t FEATURE_TYPE        Type of feature (feature|bugfix|refactoring) [default: feature]"
    echo "  -f FEATURE_DESCRIPTION Detailed description of the feature"
    echo ""
    echo "Example:"
    echo "  $0 -n my-todo-app -d \"A simple todo application\" -t feature -f \"Create a basic todo CRUD interface\""
    exit 1
}

# Parse command line arguments
while getopts "n:d:t:f:h" opt; do
    case $opt in
        n) PROJECT_NAME="$OPTARG" ;;
        d) DESCRIPTION="$OPTARG" ;;
        t) FEATURE_TYPE="$OPTARG" ;;
        f) FEATURE_DESCRIPTION="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

# Check if project name is provided
if [ -z "$PROJECT_NAME" ]; then
    echo "Error: Project name is required"
    usage
fi

# Validate project name format (lowercase, hyphens allowed)
if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo "Error: Project name must be lowercase with hyphens only (e.g., my-todo-app)"
    exit 1
fi

# Set default description if not provided
if [ -z "$DESCRIPTION" ]; then
    DESCRIPTION="A full-stack todo application built with React and Node.js"
fi

# Set default feature description if not provided
if [ -z "$FEATURE_DESCRIPTION" ]; then
    FEATURE_DESCRIPTION="$DESCRIPTION"
fi

echo "Creating project: $PROJECT_NAME"
echo "Description: $DESCRIPTION"
echo "Feature Type: $FEATURE_TYPE"
echo "Feature Description: $FEATURE_DESCRIPTION"
echo ""

# Create project directory
PROJECT_DIR="../$PROJECT_NAME"
if [ -d "$PROJECT_DIR" ]; then
    echo "Error: Directory $PROJECT_DIR already exists"
    exit 1
fi

echo "Creating project directory..."
mkdir -p "$PROJECT_DIR"

# Copy template files
echo "Copying template files..."
cp -r golden-path/templates/fullstack-todo/* "$PROJECT_DIR/"

# Replace placeholders in all files
echo "Replacing placeholders..."
find "$PROJECT_DIR" -type f \( -name "*.json" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.html" -o -name "*.sql" \) -exec sed -i.bak "s/__APP_NAME__/$PROJECT_NAME/g" {} \;
find "$PROJECT_DIR" -type f \( -name "*.json" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.html" -o -name "*.sql" \) -exec sed -i.bak "s/__APP_DESCRIPTION__/$DESCRIPTION/g" {} \;

# Clean up backup files
find "$PROJECT_DIR" -name "*.bak" -delete

# Create implementation guide
echo "Creating implementation guide..."
cat > "$PROJECT_DIR/IMPLEMENTATION_GUIDE.md" << EOF
# Implementation Guide for $PROJECT_NAME

## Project Overview
$DESCRIPTION

## Feature Type
$FEATURE_TYPE

## Feature Description
$FEATURE_DESCRIPTION

## Implementation Plan

### Phase 1: Setup and Configuration
1. Install dependencies: \`npm install\`
2. Set up environment variables
3. Configure database connection
4. Run database migrations

### Phase 2: Backend Development
1. Implement authentication endpoints
2. Create todo CRUD operations
3. Add input validation
4. Implement error handling
5. Add unit tests

### Phase 3: Frontend Development
1. Set up routing
2. Create todo components
3. Implement API integration
4. Add responsive design
5. Add unit tests

### Phase 4: Integration and Testing
1. End-to-end testing
2. Performance optimization
3. Security review
4. Documentation updates

## Next Steps
1. Review the generated plan above
2. Follow the golden path patterns
3. Implement the changes
4. Run tests and submit for review

## Project Structure
The project follows the golden path template structure with:
- React frontend with Vite, Ant Design, and Tailwind CSS
- Node.js backend with Express
- PostgreSQL database
- JWT authentication
- Comprehensive testing setup

## Getting Started
\`\`\`bash
cd $PROJECT_NAME
npm install
cp backend/env.example backend/.env
# Edit backend/.env with your database credentials
npm run migrate
npm run dev
\`\`\`
EOF

# Create catalog-info.yaml for Backstage
echo "Creating Backstage catalog info..."
cat > "$PROJECT_DIR/catalog-info.yaml" << EOF
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: $PROJECT_NAME
  description: $DESCRIPTION
  tags:
    - react
    - nodejs
    - postgresql
    - aws
    - golden-path
    - $FEATURE_TYPE
spec:
  type: service
  lifecycle: production
  owner: platform-team
EOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "Project location: $PROJECT_DIR"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_DIR"
echo "2. npm install"
echo "3. cp backend/env.example backend/.env"
echo "4. Edit backend/.env with your database credentials"
echo "5. npm run migrate"
echo "6. npm run dev"
echo ""
echo "Implementation guide: $PROJECT_DIR/IMPLEMENTATION_GUIDE.md"
