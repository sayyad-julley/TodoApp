# Backstage Backend

This package contains the Backstage backend server for the Todo Application Template.

## Overview

The backend provides:
- **Software Templates** - Scaffolder functionality for generating full-stack applications
- **Software Catalog** - Component and service discovery
- **TechDocs** - Documentation hosting
- **Search** - Full-text search across the catalog and documentation
- **Authentication** - Guest provider for development
- **Notifications** - User notification system
- **Signals** - Real-time communication

## Development

### Prerequisites

- Node.js 18+
- Yarn
- PostgreSQL (for search indexing, optional)

### Running the Backend

1. From the project root, install dependencies (if not already done):

```bash
yarn install
```

2. Start the backend:

```bash
cd packages/backend
yarn start
```

The backend will start on port 7007 by default.

### Configuration

Local configuration overrides can be added to `app-config.local.yaml` in the project root. This is useful for:
- Database connections
- Authentication providers
- API keys and secrets
- Integration configurations

## Software Templates (Scaffolder)

The backend includes the Scaffolder plugin which enables software template functionality. The templates use built-in Backstage actions:

### Available Actions

- **`fetch:template`** - Fetches and templates files with dynamic values
- **`fetch:plain`** - Fetches static files without templating
- **`publish:github`** - Publishes generated projects to GitHub repositories

### Template Location

Templates are located in `examples/template/` directory and are registered in the catalog via `app-config.yaml`.

### Adding Custom Actions

While this backend uses only built-in actions for maximum compatibility, you can add custom scaffolder actions by:

1. Creating a backend module in `src/plugins/`
2. Using the `scaffolderActionsExtensionPoint` to register actions
3. Adding the module to `src/index.ts`

Example structure:
```typescript
import { createBackendModule } from '@backstage/backend-defaults';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-backend/alpha';

export default createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-actions',
  register(env) {
    env.registerInit({
      deps: { scaffolder: scaffolderActionsExtensionPoint },
      async init({ scaffolder }) {
        // Register custom actions here
      },
    });
  },
});
```

## Populating The Catalog

The catalog is populated via locations defined in `app-config.yaml` under `catalog.locations`. These can be:
- Static YAML files
- GitHub repositories
- GitLab repositories
- Other catalog providers

For more information, see [Software Catalog Overview - Adding Components to the Catalog](https://backstage.io/docs/features/software-catalog/#adding-components-to-the-catalog).

## Authentication

The backend is configured with the **Guest Provider** for development purposes. This allows anyone to access the application without authentication.

For production, you should configure proper authentication providers:
- GitHub OAuth
- Google OAuth
- Microsoft Azure AD
- Okta
- And more via Passport strategies

Read more about:
- [Auth Backend](https://github.com/backstage/backstage/blob/master/plugins/auth-backend/README.md)
- [Adding Auth Providers](https://backstage.io/docs/auth/add-auth-provider)

## Search

The backend uses PostgreSQL for search indexing. To enable search:

1. Install and start PostgreSQL
2. Configure the connection in `app-config.yaml`:
```yaml
backend:
  database:
    client: pg
    connection:
      host: localhost
      port: 5432
      user: backstage
      password: backstage
```

Alternatively, you can use SQLite for development (already configured by default).

## Plugins and Modules

The backend includes the following plugins:

- `@backstage/plugin-scaffolder-backend` - Software templates
- `@backstage/plugin-scaffolder-backend-module-github` - GitHub integration
- `@backstage/plugin-scaffolder-backend-module-notifications` - Notifications
- `@backstage/plugin-catalog-backend` - Software catalog
- `@backstage/plugin-techdocs-backend` - Documentation
- `@backstage/plugin-search-backend` - Search functionality
- `@backstage/plugin-auth-backend` - Authentication
- `@backstage/plugin-notifications-backend` - Notifications
- `@backstage/plugin-signals-backend` - Real-time signals

## Building

To build the backend:

```bash
yarn build
```

The output will be in the `dist` directory.

## Troubleshooting

### Template Actions Not Found

If you see errors about template actions not being registered:
1. Ensure all dependencies are installed: `yarn install`
2. Rebuild the backend: `yarn build`
3. Restart the backend server

### Database Connection Issues

If you're using PostgreSQL and experiencing connection issues:
1. Verify PostgreSQL is running
2. Check connection settings in `app-config.yaml`
3. Ensure the database and user exist

## Documentation

- [Backstage Backend Documentation](https://backstage.io/docs/backend-system/)
- [Software Templates](https://backstage.io/docs/features/software-templates/)
- [Backstage Documentation](https://backstage.io/docs)
