# Backstage Template Documentation

This directory contains the Mintlify documentation for the Golden Path Backstage template.

## Quick Start

### Prerequisites

- Node.js 18+
- Mintlify CLI (install globally)

```bash
npm install -g mintlify
```

### Development

Start the local development server:

```bash
# From the todo-backstage root directory
yarn docs
```

Documentation will be available at `http://localhost:3001`.

### Build

Build the documentation for production:

```bash
yarn docs:build
```

### Deploy

Deploy to Mintlify hosting:

```bash
yarn docs:deploy
```

## Documentation Structure

```
docs/
├── mint.json                    # Mintlify configuration
├── README.md                    # This file
├── overview.mdx                 # Project overview
├── installation.mdx             # Installation guide
├── quick-start.mdx             # Quick start guide
├── architecture.mdx             # Architecture documentation
├── development/                 # Development guides
│   └── setup.mdx               # Development setup
├── templates/                   # Template documentation
│   └── overview.mdx             # Template overview
├── integrations/                # Integration guides
├── deployment/                  # Deployment guides
└── api-reference/               # API reference docs
```

## Configuration

The `mint.json` file configures:

- Site metadata and branding
- Navigation structure
- Theme and colors
- Analytics settings
- Social links

## Writing Documentation

### MDX Format

All documentation files use MDX format with frontmatter:

```markdown
---
title: Page Title
description: Page description
---

# Page Title

Content here...
```

### Components Available

- `<Card>` - Information cards
- `<CardGroup>` - Groups of cards
- `<Steps>` - Step-by-step instructions
- `<CodeGroup>` - Multiple code examples
- `<Accordion>` - Collapsible sections
- `<Warning>` - Warning messages
- `<Info>` - Information messages
- `<Note>` - Notes and tips

### Example Usage

```markdown
<CardGroup cols={2}>
  <Card title="Feature 1" icon="star">
    Description of feature 1
  </Card>
  <Card title="Feature 2" icon="heart">
    Description of feature 2
  </Card>
</CardGroup>

<Steps>
  <Step title="Step 1">
    Do this first
  </Step>
  <Step title="Step 2">
    Do this second
  </Step>
</Steps>
```

## Best Practices

1. **Clear Navigation**: Organize content logically in mint.json
2. **Consistent Formatting**: Use consistent headings and structure
3. **Code Examples**: Include working code examples for all features
4. **Visual Elements**: Use cards, steps, and accordions for better UX
5. **Search Optimization**: Use descriptive titles and descriptions
6. **Regular Updates**: Keep documentation current with code changes

## Integration with Backstage

The documentation integrates seamlessly with:

- **Backstage UI**: Accessible via Documentation tab
- **Software Catalog**: Auto-generated from component metadata
- **TechDocs**: API documentation from OpenAPI specs
- **Search**: Full-text search across all content

## Deployment

### Automatic Deployment

When connected to GitHub repository, Mintlify automatically deploys documentation on every push to the main branch.

### Manual Deployment

Deploy manually using the CLI:

```bash
# Login to Mintlify
mintlify login

# Deploy documentation
mintlify deploy
```

### Custom Domain

Configure custom domain in Mintlify dashboard:

1. Go to Settings > Domains
2. Add custom domain
3. Update DNS records as instructed

## Analytics

Track documentation usage with:

- Built-in Mintlify analytics
- Google Analytics integration
- PostHog integration
- Custom analytics via JavaScript

## Support

- [Mintlify Documentation](https://mintlify.com/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Backstage TechDocs](https://backstage.io/docs/features/techdocs/)
- [GitHub Issues](https://github.com/sayyad-julley/TodoApp/issues)