# Complete Guide: Integrating Traycer Plans into Backstage Templates

This comprehensive guide covers everything you need to know about integrating Traycer-generated plans with Backstage software templates to maintain consistency with your golden path templates.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [How It Works](#how-it-works)
7. [Customization](#customization)
8. [Advanced Usage](#advanced-usage)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)
11. [Reference](#reference)

---

## Overview

### What is This Integration?

The Traycer + Backstage integration allows you to:

- **Generate AI-powered implementation plans** using Traycer specs when creating new projects from Backstage templates
- **Maintain consistency** with your golden path templates and development standards
- **Automate planning** by incorporating Traycer's feature development, bug fixing, and refactoring workflows
- **Ensure compliance** with built-in checklists and golden path patterns

### Key Benefits

- ✅ **Consistency**: All projects follow golden path patterns automatically
- ✅ **Automation**: Traycer plans generated seamlessly during project creation
- ✅ **Compliance**: Built-in checklist ensures standards are met
- ✅ **Documentation**: Implementation guides created for each project
- ✅ **Flexibility**: Works with or without Traycer API (local fallback)

---

## Architecture

### Component Overview

The integration consists of four main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Backstage UI                              │
│         (Template Selection & Parameters)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Backstage Software Template                      │
│     (examples/template/golden-path-todo/template.yaml)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Custom Traycer Action                               │
│  (packages/backend/src/plugins/scaffolder/actions/         │
│            traycer-integration.ts)                          │
│                                                             │
│  • Reads Traycer specs from golden-path/traycer/specs/     │
│  • Calls Traycer API (if configured) or generates locally │
│  • Creates IMPLEMENTATION_GUIDE.md                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Traycer Template                               │
│  (golden-path/traycer/templates/backstage-golden-path.md)  │
│                                                             │
│  • Wraps generated plans with golden path compliance       │
│  • Adds checklists and best practices                      │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
project-root/
├── golden-path/
│   ├── traycer/
│   │   ├── specs/
│   │   │   ├── feature-development.md
│   │   │   ├── bug-fix.md
│   │   │   └── refactoring.md
│   │   └── templates/
│   │       └── backstage-golden-path.md  ← Traycer template
│   └── templates/
│       └── fullstack-todo/  ← Golden path templates
│
└── todo-backstage/
    ├── packages/
    │   └── backend/
    │       └── src/
    │           └── plugins/
    │               └── scaffolder/
    │                   ├── actions/
    │                   │   └── traycer-integration.ts  ← Custom action
    │                   └── traycer-module.ts  ← Module registration
    │
    ├── examples/
    │   └── template/
    │       └── golden-path-todo/
    │           ├── template.yaml  ← Backstage template
    │           └── content/
    │               └── catalog-info.yaml
    │
    ├── app-config.yaml  ← Configuration
    └── TRAYCER_INTEGRATION.md  ← This guide
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn installed
- Backstage instance running
- Access to golden path templates
- (Optional) Traycer API key

### Step 1: Install Dependencies

```bash
cd todo-backstage
yarn install
```

This installs the required dependencies including `fs-extra` for file operations.

### Step 2: Verify File Structure

Ensure all integration files are in place:

```bash
# Check custom action exists
ls -la packages/backend/src/plugins/scaffolder/actions/traycer-integration.ts

# Check module exists
ls -la packages/backend/src/plugins/scaffolder/traycer-module.ts

# Check template exists
ls -la examples/template/golden-path-todo/template.yaml

# Check Traycer template exists
ls -la ../golden-path/traycer/templates/backstage-golden-path.md
```

### Step 3: Verify Backend Registration

Check that the module is registered in `packages/backend/src/index.ts`:

```typescript
// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);
// custom scaffolder actions
backend.add(import('./plugins/scaffolder/traycer-module'));
```

### Step 4: Build Backend

```bash
cd packages/backend
yarn build
```

---

## Configuration

### 1. Environment Variables

Set these in your Backstage backend environment:

```bash
# Optional: Traycer API configuration
export TRAYCER_API_URL=https://api.traycer.ai
export TRAYCER_API_KEY=your-api-key-here

# Required: GitHub token for publishing repositories
export GITHUB_TOKEN=your-github-token
```

**Note**: If `TRAYCER_API_KEY` is not set, the integration will automatically fall back to local plan generation using Traycer specs.

### 2. App Configuration (`app-config.yaml`)

The configuration is already set up. Verify it includes:

```yaml
# Traycer integration configuration
traycer:
  apiUrl: ${TRAYCER_API_URL:-https://api.traycer.ai}
  apiKey: ${TRAYCER_API_KEY:-}

# Template registration in catalog
catalog:
  locations:
    # Golden Path Todo template with Traycer integration
    - type: file
      target: ../../examples/template/golden-path-todo/template.yaml
      rules:
        - allow: [Template]
```

### 3. Template URL Configuration

Edit `examples/template/golden-path-todo/template.yaml` to point to your golden path templates:

**Option 1: GitHub Repository** (Production)
```yaml
- id: fetch-base
  name: Fetch Base Template
  action: fetch:template
  input:
    url: https://github.com/your-org/golden-path-templates
    values:
      name: ${{ parameters.name }}
      description: ${{ parameters.description }}
      __APP_NAME__: ${{ parameters.name }}
```

**Option 2: Local File Path** (Development)
```yaml
- id: fetch-base
  name: Fetch Base Template
  action: fetch:template
  input:
    url: file://../../../../golden-path/templates/fullstack-todo
    values:
      name: ${{ parameters.name }}
      description: ${{ parameters.description }}
      __APP_NAME__: ${{ parameters.name }}
```

---

## Usage

### Starting Backstage

```bash
cd todo-backstage
yarn start
```

This starts both frontend (`http://localhost:3000`) and backend (`http://localhost:7007`).

### Using the Template

1. **Navigate to Template Page**
   - Go to `http://localhost:3000/create`
   - Or click "Create Component" in Backstage UI

2. **Select Template**
   - Find "Golden Path Fullstack Todo" in the template list
   - Click to select it

3. **Fill in Parameters**

   **Required Fields:**
   - **Project Name**: Lowercase, hyphens allowed (e.g., `my-todo-app`)
   - **Description**: Brief description of the project
   - **Repository Location**: GitHub repository URL where project will be created

   **Optional Fields:**
   - **Feature Type**: Choose from:
     - `feature` - For new feature development
     - `bugfix` - For bug fixes
     - `refactoring` - For code refactoring
   - **Feature Description**: Detailed description for Traycer plan generation

4. **Execute Template**
   - Click "Create" or "Execute"
   - Watch the execution steps:
     - ✅ Fetch Base Template
     - ✅ Generate Traycer Plan
     - ✅ Create Implementation Guide
     - ✅ Publish
     - ✅ Register

5. **Review Generated Project**
   - Check the repository for generated files
   - Review `IMPLEMENTATION_GUIDE.md` for the Traycer-generated plan
   - Follow the plan to implement your feature

### Example Usage

**Creating a Feature:**
```
Project Name: user-notifications
Description: Add email notifications for todo updates
Feature Type: feature
Feature Description: Users should receive email notifications when:
- A todo is assigned to them
- A todo they created is updated
- A todo they're watching is completed
Repository: github.com?owner=myorg&repo=user-notifications
```

**Creating a Bug Fix:**
```
Project Name: fix-auth-token
Description: Fix JWT token expiration handling
Feature Type: bugfix
Feature Description: Tokens expire after 1 hour but refresh fails silently.
Need to properly handle token refresh and provide user feedback.
Repository: github.com?owner=myorg&repo=fix-auth-token
```

---

## How It Works

### Execution Flow

```
1. User selects template
   ↓
2. User fills parameters (including feature type & description)
   ↓
3. Backstage executes template steps:
   │
   ├─→ Step 1: Fetch Base Template
   │   • Downloads/clones golden path template
   │   • Replaces placeholders (__APP_NAME__, etc.)
   │
   ├─→ Step 2: Generate Traycer Plan
   │   • Reads spec file from golden-path/traycer/specs/{spec}.md
   │   • Calls Traycer API (if configured) OR generates locally
   │   • Applies backstage-golden-path.md template
   │   • Creates structured plan with golden path compliance
   │
   ├─→ Step 3: Create Implementation Guide
   │   • Writes plan to IMPLEMENTATION_GUIDE.md
   │   • Includes checklists and references
   │
   ├─→ Step 4: Publish
   │   • Creates GitHub repository
   │   • Pushes all files
   │
   └─→ Step 5: Register
       • Registers component in Backstage catalog
       • Creates catalog-info.yaml entry
```

### Traycer Plan Generation Details

The custom action (`traycer-integration.ts`) performs these steps:

1. **Reads Traycer Spec**
   ```typescript
   // Reads from golden-path/traycer/specs/{spec}.md
   const specPath = path.join(
     goldenPathDir,
     '..',
     'traycer',
     'specs',
     `${spec}.md`
   );
   const specContent = await fs.readFile(specPath, 'utf-8');
   ```

2. **Calls Traycer API** (if configured)
   ```typescript
   if (traycerApiKey) {
     const response = await fetch(`${traycerApiUrl}/generate-plan`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${traycerApiKey}`,
       },
       body: JSON.stringify({
         spec: spec,
         projectName: projectName,
         description: description,
         template: 'backstage-golden-path',
         context: {
           goldenPathTemplate: 'fullstack-todo',
           referenceFiles: [...],
           specContent: specContent,
         },
       }),
     });
   }
   ```

3. **Falls Back to Local Generation** (if API unavailable)
   ```typescript
   // Generates plan using local template
   const planContent = await generateLocalPlan(
     spec,
     projectName,
     description,
     specContent,
     goldenPathTemplate
   );
   ```

4. **Writes Implementation Guide**
   ```typescript
   const planPath = resolveSafeChildPath(
     workspacePath,
     'IMPLEMENTATION_GUIDE.md'
   );
   await fs.writeFile(planPath, planContent, 'utf-8');
   ```

### Generated Plan Structure

The `IMPLEMENTATION_GUIDE.md` includes:

```markdown
# Development Plan for {project-name}

## Project Context
- Template: Golden Path fullstack-todo
- Tech Stack: React 18 + Node.js + PostgreSQL + AWS
- Architecture: Follows golden path patterns

## Feature Description
{user-provided description}

## Specification Reference
{content from Traycer spec file}

## Implementation Plan
{detailed steps based on spec type}

## Golden Path Compliance Checklist

### Backend Implementation
- [ ] Follow RESTful conventions
- [ ] Use authentication patterns
- [ ] Implement error handling
- [ ] Add validation

### Frontend Implementation
- [ ] Follow component patterns
- [ ] Use Tailwind CSS
- [ ] Implement state management
- [ ] Add loading/error states

### Testing Requirements
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Documentation
- [ ] Update API docs
- [ ] Add component docs
- [ ] Update architecture docs

## Post-Implementation
1. Run npm test
2. Run npm run test:e2e
3. Ensure CodeRabbit review passes
4. Update changelog
```

---

## Customization

### Adding New Traycer Specs

1. **Create Spec File**
   ```bash
   # Create new spec in golden-path/traycer/specs/
   touch golden-path/traycer/specs/security-audit.md
   ```

2. **Write Spec Content**
   ```markdown
   # Security Audit Specification
   
   This specification defines the workflow for security audits...
   ```

3. **Update Template Enum**
   Edit `examples/template/golden-path-todo/template.yaml`:
   ```yaml
   featureType:
     enum: [feature, bugfix, refactoring, security-audit]
     ui:enum: [feature, bugfix, refactoring, security-audit]
   ```

4. **Update Action Handler**
   Edit `packages/backend/src/plugins/scaffolder/actions/traycer-integration.ts`:
   ```typescript
   spec: {
     enum: ['feature', 'bugfix', 'refactoring', 'security-audit'],
   }
   ```

### Modifying Traycer Template

Edit `golden-path/traycer/templates/backstage-golden-path.md` to customize:

- Plan structure
- Checklist items
- Post-implementation steps
- Compliance requirements

**Example: Adding Custom Checklist Item**
```markdown
## Golden Path Compliance Checklist

### Security
- [ ] Run security audit
- [ ] Check for vulnerabilities
- [ ] Review authentication flow
```

### Modifying Backstage Template

Edit `examples/template/golden-path-todo/template.yaml` to:

- Add new parameters
- Modify steps
- Change output structure
- Add additional actions

**Example: Adding Custom Parameter**
```yaml
parameters:
  - title: Project Details
    properties:
      # ... existing properties ...
      techStack:
        title: Tech Stack
        type: string
        description: Preferred tech stack
        enum: [react-nodejs, vue-nestjs, angular-dotnet]
```

### Customizing Action Behavior

Edit `packages/backend/src/plugins/scaffolder/actions/traycer-integration.ts`:

- Modify plan generation logic
- Add custom validation
- Change file paths
- Add additional outputs

---

## Advanced Usage

### Using Multiple Golden Path Templates

Modify the template to support multiple template types:

```yaml
parameters:
  properties:
    goldenPathTemplate:
      title: Golden Path Template
      type: string
      enum: [fullstack-todo, microservice, serverless]
      default: fullstack-todo
```

Update the action to handle different templates:

```typescript
const goldenPathTemplate = ctx.input.goldenPathTemplate || 'fullstack-todo';
// Use template-specific logic
```

### Conditional Plan Generation

Add conditions to skip plan generation for certain scenarios:

```yaml
steps:
  - id: generate-traycer-plan
    name: Generate Traycer Plan
    action: traycer:generate-plan
    if: ${{ parameters.featureType !== 'none' }}
    input:
      # ... inputs ...
```

### Custom Plan Templates

Create multiple Traycer templates for different scenarios:

```
golden-path/traycer/templates/
├── backstage-golden-path.md
├── backstage-microservice.md
└── backstage-serverless.md
```

Use them in the template:

```yaml
- id: generate-traycer-plan
  action: traycer:generate-plan
  input:
    template: ${{ parameters.templateType === 'microservice' ? 'backstage-microservice' : 'backstage-golden-path' }}
```

### Integration with CI/CD

Add steps to automatically run tests after plan generation:

```yaml
steps:
  - id: generate-traycer-plan
    # ... existing step ...
  
  - id: validate-plan
    name: Validate Plan
    action: exec:command
    input:
      command: npm run validate-implementation-guide
      workingDirectory: ${{ steps.generate-traycer-plan.output.planPath }}
```

---

## Troubleshooting

### Action Not Found Error

**Error**: `Action not found: traycer:generate-plan`

**Solutions**:
1. Restart Backstage backend:
   ```bash
   cd todo-backstage/packages/backend
   yarn start
   ```

2. Verify module registration in `packages/backend/src/index.ts`:
   ```typescript
   backend.add(import('./plugins/scaffolder/traycer-module'));
   ```

3. Check module file exists:
   ```bash
   ls -la packages/backend/src/plugins/scaffolder/traycer-module.ts
   ```

4. Rebuild backend:
   ```bash
   cd packages/backend
   yarn build
   ```

### Template Not Showing in UI

**Error**: Template doesn't appear in Backstage UI

**Solutions**:
1. Verify catalog configuration in `app-config.yaml`:
   ```yaml
   catalog:
     locations:
       - type: file
         target: ../../examples/template/golden-path-todo/template.yaml
         rules:
           - allow: [Template]
   ```

2. Check file path is correct (relative to backend directory)

3. Restart Backstage backend

4. Check browser console for errors:
   - Open DevTools (F12)
   - Check Console tab for catalog errors

5. Verify template YAML syntax:
   ```bash
   # Validate YAML syntax
   cat examples/template/golden-path-todo/template.yaml | yq eval .
   ```

### Traycer API Errors

**Error**: `Traycer API error: 401 Unauthorized`

**Solutions**:
1. Verify API key is correct:
   ```bash
   echo $TRAYCER_API_KEY
   ```

2. Check API URL is correct:
   ```bash
   echo $TRAYCER_API_URL
   ```

3. The action automatically falls back to local generation - check logs:
   ```bash
   cd todo-backstage/packages/backend
   yarn start
   # Look for: "Failed to call Traycer API: ... Generating plan locally."
   ```

4. Test API connectivity:
   ```bash
   curl -X POST https://api.traycer.ai/generate-plan \
     -H "Authorization: Bearer $TRAYCER_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"spec":"feature","projectName":"test","description":"test"}'
   ```

### Plan Generation Fails

**Error**: Plan not generated or empty

**Solutions**:
1. Check spec file exists:
   ```bash
   ls -la golden-path/traycer/specs/feature-development.md
   ```

2. Verify file permissions:
   ```bash
   chmod 644 golden-path/traycer/specs/*.md
   ```

3. Check backend logs for errors:
   ```bash
   cd todo-backstage/packages/backend
   yarn start
   # Look for file read errors
   ```

4. Verify workspace path resolution:
   - Check `workspacePath` in action logs
   - Ensure relative paths are correct

### GitHub Publishing Fails

**Error**: Failed to publish repository

**Solutions**:
1. Verify GitHub token:
   ```bash
   echo $GITHUB_TOKEN
   ```

2. Check token permissions:
   - Must have `repo` scope
   - Must have access to target organization

3. Verify repository doesn't exist:
   - Check GitHub for existing repository
   - Use different repository name

4. Check GitHub integration in `app-config.yaml`:
   ```yaml
   integrations:
     github:
       - host: github.com
         token: ${GITHUB_TOKEN}
   ```

### IMPLEMENTATION_GUIDE.md Not Created

**Error**: Plan generated but file not found

**Solutions**:
1. Check workspace path:
   ```typescript
   // In action logs
   ctx.logger.info('Workspace path:', { workspacePath });
   ```

2. Verify file write permissions:
   ```bash
   ls -la /tmp/backstage-scaffolder-*/
   ```

3. Check action output:
   ```typescript
   // Verify output is set
   ctx.output('planPath', 'IMPLEMENTATION_GUIDE.md');
   ```

4. Check repository after publishing:
   - File should be in root directory
   - Check GitHub repository contents

---

## Best Practices

### 1. Template Organization

- Keep templates in version control
- Use semantic versioning for templates
- Document template changes in CHANGELOG

### 2. Spec Management

- Keep specs focused and specific
- Update specs as patterns evolve
- Version control spec files

### 3. Plan Customization

- Customize templates per organization needs
- Keep checklists actionable
- Include references to actual code paths

### 4. Error Handling

- Always provide fallback mechanisms
- Log errors clearly
- Guide users to solutions

### 5. Testing

- Test template locally before deployment
- Verify all spec types work
- Test with and without API key

### 6. Documentation

- Keep implementation guides updated
- Document customizations
- Share knowledge with team

---

## Reference

### File Locations

| Component | Location |
|-----------|----------|
| Custom Action | `todo-backstage/packages/backend/src/plugins/scaffolder/actions/traycer-integration.ts` |
| Module Registration | `todo-backstage/packages/backend/src/plugins/scaffolder/traycer-module.ts` |
| Backstage Template | `todo-backstage/examples/template/golden-path-todo/template.yaml` |
| Traycer Template | `golden-path/traycer/templates/backstage-golden-path.md` |
| Traycer Specs | `golden-path/traycer/specs/*.md` |
| Configuration | `todo-backstage/app-config.yaml` |

### Action Parameters

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `spec` | string | Yes | Traycer spec type: `feature`, `bugfix`, `refactoring` |
| `projectName` | string | Yes | Name of the project |
| `description` | string | Yes | Feature/change description |
| `template` | string | No | Traycer template name (default: `backstage-golden-path`) |
| `goldenPathTemplate` | string | No | Golden path template name (default: `fullstack-todo`) |

### Action Outputs

| Output | Type | Description |
|--------|------|-------------|
| `plan` | string | Generated plan content |
| `planPath` | string | Path to plan file (`IMPLEMENTATION_GUIDE.md`) |

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRAYCER_API_URL` | No | `https://api.traycer.ai` | Traycer API endpoint |
| `TRAYCER_API_KEY` | No | - | Traycer API authentication key |
| `GITHUB_TOKEN` | Yes | - | GitHub token for repository creation |

### Configuration Keys

| Key | Type | Description |
|-----|------|-------------|
| `traycer.apiUrl` | string | Traycer API URL |
| `traycer.apiKey` | string | Traycer API key |

### Links

- [Backstage Software Templates Documentation](https://backstage.io/docs/features/software-templates/)
- [Traycer Documentation](https://docs.traycer.ai)
- [Golden Path Guide](/golden-path/GOLDEN_PATH.md)
- [Traycer Integration Guide](/golden-path/docs/guides/traycer-integration.md)

---

## Support

For issues or questions:

1. Check this guide first
2. Review troubleshooting section
3. Check backend logs
4. Review Backstage and Traycer documentation
5. Contact your platform team

---

**Last Updated**: See git history for this file
**Version**: 1.0.0

