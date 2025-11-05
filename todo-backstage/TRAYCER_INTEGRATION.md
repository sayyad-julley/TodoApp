# Traycer + Backstage Integration Setup Guide

This guide explains how the Traycer integration with Backstage works and how to use it.

## Architecture Overview

The integration consists of several components:

1. **Custom Traycer Action** (`packages/backend/src/plugins/scaffolder/actions/traycer-integration.ts`)
   - Generates implementation plans using Traycer specs
   - Falls back to local generation if Traycer API is unavailable

2. **Scaffolder Module** (`packages/backend/src/plugins/scaffolder/traycer-module.ts`)
   - Registers the custom action with Backstage's scaffolder

3. **Backstage Template** (`examples/template/golden-path-todo/template.yaml`)
   - Defines the software template that uses Traycer integration
   - Includes steps for plan generation and project scaffolding

4. **Traycer Template** (`golden-path/traycer/templates/backstage-golden-path.md`)
   - Custom template used by Traycer to generate Backstage-compatible plans

## Configuration

### 1. Environment Variables

Set these in your Backstage backend environment:

```bash
# Optional: Traycer API configuration
export TRAYCER_API_URL=https://api.traycer.ai
export TRAYCER_API_KEY=your-api-key-here

# Required: GitHub token for publishing
export GITHUB_TOKEN=your-github-token
```

### 2. App Config

The configuration is already set up in `app-config.yaml`:

```yaml
traycer:
  apiUrl: ${TRAYCER_API_URL:-https://api.traycer.ai}
  apiKey: ${TRAYCER_API_KEY:-}
```

### 3. Template Registration

The template is registered in `app-config.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: ../../examples/template/golden-path-todo/template.yaml
      rules:
        - allow: [Template]
```

## How It Works

### Step-by-Step Flow

1. **User selects template** in Backstage UI
2. **User fills in parameters**:
   - Project name
   - Description
   - Feature type (feature/bugfix/refactoring)
   - Feature description
3. **Backstage executes template steps**:
   - Fetches base template from golden path
   - Calls `traycer:generate-plan` action
   - Creates implementation guide
   - Publishes to repository
   - Registers in catalog

### Traycer Plan Generation

The custom action:
1. Reads Traycer spec files from `/golden-path/traycer/specs/`
2. Calls Traycer API (if configured) or generates locally
3. Creates `IMPLEMENTATION_GUIDE.md` with:
   - Feature description
   - Implementation steps
   - Golden path compliance checklist
   - Testing requirements
   - Documentation requirements

## Customization

### Adding New Traycer Specs

1. Create a new spec file in `/golden-path/traycer/specs/`
2. Add it to the `featureType` enum in `template.yaml`
3. Update the action handler to support the new spec type

### Modifying the Template

Edit `examples/template/golden-path-todo/template.yaml` to:
- Add new parameters
- Modify steps
- Change output structure

### Updating Traycer Template

Edit `golden-path/traycer/templates/backstage-golden-path.md` to customize:
- Plan structure
- Checklist items
- Post-implementation steps

## Troubleshooting

### Action Not Found

If you see "Action not found: traycer:generate-plan":
1. Check that the module is imported in `packages/backend/src/index.ts`
2. Verify the module file exists
3. Restart the Backstage backend

### Traycer API Errors

If Traycer API calls fail:
- The action will automatically fall back to local generation
- Check logs for specific error messages
- Verify `TRAYCER_API_KEY` is correct (if using API)

### Template Not Showing

If the template doesn't appear in Backstage:
1. Check `app-config.yaml` catalog locations
2. Verify file path is correct
3. Restart Backstage backend
4. Check browser console for errors

## Development

### Testing Locally

1. Start Backstage:
   ```bash
   cd todo-backstage
   yarn install
   yarn start
   ```

2. Go to `http://localhost:3000/create`
3. Select "Golden Path Fullstack Todo"
4. Fill in template parameters
5. Execute and verify plan generation

### Debugging

Enable debug logging in the action:
```typescript
ctx.logger.info('Debug message', { context });
```

Check backend logs:
```bash
# In another terminal
cd todo-backstage/packages/backend
yarn start
```

## References

- [Backstage Software Templates](https://backstage.io/docs/features/software-templates/)
- [Traycer Documentation](https://docs.traycer.ai)
- [Golden Path Guide](/golden-path/GOLDEN_PATH.md)

