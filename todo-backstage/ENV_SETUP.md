# Environment Variables Setup Guide

This guide explains how to set up the `GITHUB_TOKEN` environment variable for Backstage.

## Quick Setup

### Option 1: Use the Setup Script (Recommended)

```bash
cd todo-backstage
chmod +x setup-env.sh
./setup-env.sh
```

The script will:
- Prompt you for your GitHub token
- Create a `.env` file with your token
- Provide instructions for using it

### Option 2: Manual Setup

#### Step 1: Get Your GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select the **`repo`** scope (full control of private repositories)
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't be able to see it again)

#### Step 2: Set the Token

Choose one of these methods:

**Method A: Export in Terminal (Temporary - Current Session Only)**
```bash
export GITHUB_TOKEN=your-github-token-here
```

**Method B: Add to Shell Profile (Permanent)**
```bash
# For zsh (macOS default)
echo 'export GITHUB_TOKEN=your-github-token-here' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export GITHUB_TOKEN=your-github-token-here' >> ~/.bashrc
source ~/.bashrc
```

**Method C: Create .env File (Development)**
```bash
cd todo-backstage
cat > .env << EOF
GITHUB_TOKEN=your-github-token-here
EOF
```

Then source it before starting Backstage:
```bash
source .env && yarn dev
```

**Method D: Inline with Command**
```bash
GITHUB_TOKEN=your-token-here yarn dev
```

## Verify Token is Set

Check if the token is available:
```bash
echo $GITHUB_TOKEN
```

If it shows your token, it's set correctly. If it's empty, you need to set it.

## How Backstage Uses the Token

The token is referenced in `app-config.yaml`:
```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

Backstage reads this environment variable when it starts, so make sure it's set **before** starting the backend.

## Starting Backstage with Token

**Important:** The `todo-backstage` directory contains configuration files. The actual Backstage app is in `todo-template`. Use one of these methods:

### Option 1: Use the Startup Script (Recommended)
```bash
cd todo-backstage
./start-backstage.sh
```

### Option 2: Manual with .env file
```bash
cd todo-backstage
source .env
cd ../todo-template
yarn start
```

### Option 3: Export token and start
```bash
cd todo-backstage
export GITHUB_TOKEN=your-token-here
cd ../todo-template
yarn start
```

### Option 4: Inline token
```bash
cd todo-template
GITHUB_TOKEN=your-token-here yarn start
```

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit tokens to version control**
   - The `.env` file is already in `.gitignore`
   - Never add tokens to `app-config.yaml` directly

2. **Use different tokens for different environments**
   - Development: Personal Access Token
   - Production: Use AWS Secrets Manager or similar

3. **Rotate tokens regularly**
   - If a token is compromised, revoke it immediately
   - Generate a new token and update your environment

## Troubleshooting

### Token Not Working

1. **Verify token has correct scopes:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Check that your token has the `repo` scope

2. **Check token is set:**
   ```bash
   echo $GITHUB_TOKEN
   ```

3. **Verify token is exported:**
   ```bash
   env | grep GITHUB_TOKEN
   ```

4. **Restart Backstage** after setting the token

### Backstage Can't Access GitHub

- Ensure `GITHUB_TOKEN` is set before starting Backstage
- Check token hasn't expired
- Verify token has `repo` scope
- Check GitHub integration is configured in `app-config.yaml`

## Where to Add Your Token

**📍 Location:** Set `GITHUB_TOKEN` as an environment variable in your terminal/shell before starting Backstage.

**Quick Reference:**
- **File:** `.env` (in `todo-backstage/` directory)
- **Shell:** Export in `~/.zshrc` or `~/.bashrc`
- **Command:** `export GITHUB_TOKEN=your-token-here`

The token is automatically read by Backstage from the environment when it starts.

