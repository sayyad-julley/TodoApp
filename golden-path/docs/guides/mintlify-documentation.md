# Mintlify Documentation Setup Guide

This guide covers setting up and maintaining documentation with Mintlify for your golden path project.

## What is Mintlify?

Mintlify is a modern documentation platform that:
- Generates beautiful, searchable documentation from Markdown
- Provides automatic API documentation from OpenAPI specs
- Supports custom domains and branding
- Includes built-in analytics and search
- Offers seamless GitHub integration

## Benefits

- **Developer-Friendly**: Write docs in Markdown, Mintlify handles the rest
- **API Integration**: Automatic API docs from OpenAPI/Swagger specs
- **Search**: Built-in full-text search
- **Customization**: Brand your docs with logos and colors
- **GitHub Sync**: Automatic updates from your repository

## Installation

### Mintlify CLI

Install the Mintlify CLI:

```bash
npm install -g mintlify
```

### Verify Installation

```bash
mintlify --version
```

## Configuration

### Golden Path Docs

The golden path documentation uses Mintlify:

**Location**: `/golden-path/docs/mint.json`

This configuration documents the golden path itself, including:
- Overview and getting started
- Guides for AWS services
- Tool integration guides
- Template documentation

### Template-Specific Docs

Each template has its own documentation:

**Location**: `/golden-path/templates/fullstack-todo/docs/`

This includes:
- API reference
- Architecture overview
- Development guides
- User guides

### Mint.json Structure

```json
{
  "$schema": "https://mintlify.com/schema.json",
  "name": "Project Name",
  "logo": {
    "dark": "/logo/dark.svg",
    "light": "/logo/light.svg"
  },
  "favicon": "/favicon.png",
  "colors": {
    "primary": "#3B82F6",
    "light": "#60A5FA",
    "dark": "#1D4ED8"
  },
  "navigation": [
    {
      "group": "Get Started",
      "pages": ["introduction", "quickstart"]
    }
  ]
}
```

## Writing Documentation

### MDX Format

Mintlify uses MDX (Markdown + JSX) for documentation:

```mdx
---
title: Getting Started
description: Learn how to get started with our API
---

# Getting Started

Welcome to our API documentation!

## Installation

Install the package:

<CodeGroup>

```bash npm
npm install @your-package/api
```

```bash yarn
yarn add @your-package/api
```

</CodeGroup>
```

### API Reference

Document APIs using OpenAPI/Swagger:

```yaml
openapi: 3.0.0
info:
  title: Todo API
  version: 1.0.0
paths:
  /api/todos:
    get:
      summary: Get all todos
      responses:
        '200':
          description: Successful response
```

Reference in mint.json:

```json
{
  "navigation": [
    {
      "group": "API Reference",
      "pages": [
        {
          "title": "Todos",
          "openapi": "openapi.yaml"
        }
      ]
    }
  ]
}
```

### Code Blocks

Use code blocks with syntax highlighting:

````mdx
```javascript
const response = await fetch('/api/todos');
const todos = await response.json();
```
````

### Components

Mintlify provides custom components:

```mdx
<Warning>
  This is a warning message.
</Warning>

<Info>
  This is an information message.
</Info>

<Note>
  This is a note.
</Note>
```

### Callouts

Use callouts for important information:

```mdx
<Callout>
  **Important**: Make sure to set up environment variables before running the application.
</Callout>
```

## Navigation Structure

Organize documentation in mint.json:

```json
{
  "navigation": [
    {
      "group": "Get Started",
      "pages": [
        "introduction",
        "quickstart",
        "development-setup"
      ]
    },
    {
      "group": "Architecture",
      "pages": [
        "architecture/overview",
        "architecture/frontend",
        "architecture/backend"
      ]
    },
    {
      "group": "API Reference",
      "pages": [
        {
          "title": "Authentication",
          "openapi": "api-reference/authentication.yaml"
        },
        {
          "title": "Todos",
          "openapi": "api-reference/todos.yaml"
        }
      ]
    }
  ]
}
```

## Local Development

### Start Local Server

```bash
cd golden-path/docs
mintlify dev
```

Documentation will be available at `http://localhost:3000`

### Preview Changes

Mintlify automatically reloads when you save changes to MDX files.

## Deployment

### Mintlify Hosting

Deploy to Mintlify hosting:

```bash
# Login to Mintlify
mintlify login

# Deploy documentation
mintlify deploy
```

### Custom Domain Setup

1. Go to Mintlify dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

### GitHub Integration

Connect your GitHub repository:

1. Go to Mintlify dashboard
2. Navigate to Settings > GitHub
3. Connect your repository
4. Enable automatic deployments

## Search Configuration

Mintlify includes built-in search. Configure search behavior:

```json
{
  "mintlify": {
    "search": {
      "enabled": true,
      "maxResults": 10
    }
  }
}
```

### Custom Search

Use Algolia for enhanced search:

```json
{
  "mintlify": {
    "search": {
      "provider": "algolia",
      "appId": "your-app-id",
      "apiKey": "your-api-key",
      "indexName": "your-index-name"
    }
  }
}
```

## Analytics Integration

### Mintlify Analytics

Built-in analytics are available in the Mintlify dashboard:
- Page views
- Popular pages
- Search queries
- User paths

### Google Analytics

Add Google Analytics:

```json
{
  "mintlify": {
    "analytics": {
      "google": "G-XXXXXXXXXX"
    }
  }
}
```

## Best Practices

### Documentation Structure

1. **Start with Overview**: Provide high-level introduction
2. **Quick Start**: Get users up and running quickly
3. **Detailed Guides**: Comprehensive guides for complex topics
4. **API Reference**: Complete API documentation
5. **Examples**: Include code examples throughout

### Writing Style

- **Clear and Concise**: Use simple language
- **Action-Oriented**: Tell users what to do
- **Examples**: Include code examples
- **Visuals**: Add diagrams and screenshots
- **Up-to-Date**: Keep documentation current

### Organization

- **Logical Flow**: Organize from general to specific
- **Consistent Formatting**: Use consistent heading styles
- **Cross-References**: Link related topics
- **Searchability**: Use descriptive headings and keywords

### Code Examples

- **Complete Examples**: Provide working code
- **Multiple Languages**: Support different languages
- **Context**: Explain what the code does
- **Best Practices**: Follow coding standards

## Troubleshooting

### Build Errors

```bash
# Check for syntax errors
mintlify check

# Validate mint.json
mintlify validate
```

### Missing Pages

- Verify page paths in mint.json match file paths
- Check file extensions (.mdx, .md)
- Ensure files exist in the docs directory

### API Documentation Not Appearing

- Verify OpenAPI spec is valid
- Check file path in mint.json
- Ensure OpenAPI file is in correct location

### Deployment Issues

- Check Mintlify CLI is logged in
- Verify repository connection
- Check build logs in Mintlify dashboard

## Additional Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [MDX Guide](https://mdxjs.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Golden Path Docs Config](../docs/mint.json)
- [Template Docs Config](../templates/fullstack-todo/docs/)
