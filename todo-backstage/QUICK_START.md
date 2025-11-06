# Quick Start Guide

## Directory Structure

- **`todo-backstage/`** - Configuration and documentation directory
  - Contains `app-config.yaml`, templates, and setup scripts
  - Does NOT contain the Backstage app code
  
- **`todo-template/`** - Actual Backstage application
  - Contains `package.json` and Backstage app code
  - This is where you run `yarn start`

## Starting Backstage

### Method 1: Use the Startup Script (Easiest)
```bash
cd todo-backstage
./start-backstage.sh
```

This script will:
- Load your `.env` file from `todo-backstage/`
- Automatically switch to `todo-template/` directory
- Start Backstage with `yarn start`

### Method 2: Manual Steps
```bash
# 1. Set your GitHub token
cd todo-backstage
source .env  # or: export GITHUB_TOKEN=your-token-here

# 2. Go to the Backstage app directory
cd ../todo-template

# 3. Start Backstage
yarn start
```

## Setting Up GitHub Token

If you haven't set up your token yet:

```bash
cd todo-backstage
./setup-env.sh
```

This will create a `.env` file with your GitHub token.

## Troubleshooting

**Error: "Couldn't find a script named 'start'"**
- You're in the wrong directory
- Run from `todo-template/` or use `./start-backstage.sh` from `todo-backstage/`

**Error: "GITHUB_TOKEN is not set"**
- Run `./setup-env.sh` to set up your token
- Or manually export: `export GITHUB_TOKEN=your-token-here`

