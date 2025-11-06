# Fix for YAML Template Error

## Problem
The error occurs when Backstage tries to fetch a SpringBoot gRPC template from:
```
https://github.com/backstage/software-templates/tree/main/scaffolder-templates/springboot-grpc-template/skeleton/catalog-info.yaml
```

The file contains Jinja2 template syntax like `{%- if values.description %}` that's being parsed as plain YAML instead of being processed as a template.

## Root Cause
1. The external template URL is being fetched directly without template processing
2. The `catalog-info.yaml` contains unprocessed template directives
3. Template syntax is being interpreted as invalid YAML

## Solutions

### Option 1: Use Local Templates (Recommended)
Replace external template references with local templates. Your current setup already uses local templates in `examples/template/`.

### Option 2: Fix External Template Reference
If you need the SpringBoot template, reference it correctly:

```yaml
# In app-config.yaml catalog.locations
- type: url
  target: https://github.com/backstage/software-templates/blob/main/scaffolder-templates/springboot-grpc-template/template.yaml
  rules:
    - allow: [Template]
```

### Option 3: Clear Template Cache
The error might be from a cached reference:

```bash
# Stop Backstage
# Clear any cache directories
# Restart Backstage
```

### Option 4: Update Template API Version
The external template might be using an outdated API version. Ensure templates use `scaffolder.backstage.io/v1beta3`.

## Current Status
Your local templates are properly configured and should work correctly. The error appears to be from an external reference that's no longer in your configuration files.

## Next Steps
1. Check if any external template references exist
2. Clear any template caches
3. Restart Backstage services
4. Use local templates instead of external ones