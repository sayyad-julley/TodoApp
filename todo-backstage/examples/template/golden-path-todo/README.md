# Golden Path Todo Template with Traycer Integration

This Backstage template creates a new full-stack todo application following the Golden Path patterns, with integrated Traycer AI plan generation.

## Features

- **Golden Path Compliance**: Follows standard patterns from `/golden-path/templates/fullstack-todo/`
- **Traycer Integration**: Automatically generates implementation plans based on feature specifications
- **Complete Scaffolding**: Sets up React frontend, Node.js backend, and PostgreSQL database structure
- **Best Practices**: Includes testing, documentation, and CI/CD setup

## Usage

1. **Select the Template**: In Backstage, go to "Create Component" and select "Golden Path Fullstack Todo"
2. **Fill in Details**:
   - Project name (lowercase, hyphens allowed)
   - Description
   - Feature type (feature, bugfix, refactoring)
   - Feature description (detailed description for Traycer plan generation)
   - Repository location

3. **Execute**: The template will:
   - Fetch the base golden path template
   - Generate a Traycer implementation plan
   - Create an implementation guide
   - Publish to your repository
   - Register in the catalog

## Generated Files

- Complete project structure following golden path patterns
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation plan from Traycer
- `catalog-info.yaml` - Backstage catalog registration

## Configuration

### Traycer Configuration

Set the following environment variables (optional):

```bash
export TRAYCER_API_URL=https://api.traycer.ai  # Default
export TRAYCER_API_KEY=your-api-key-here       # Optional, falls back to local generation
```

If `TRAYCER_API_KEY` is not set, the template will generate plans locally using the Traycer specs.

## Next Steps After Creation

1. Review the `IMPLEMENTATION_GUIDE.md` file
2. Update environment variables in `.env` files
3. Set up your database
4. Run migrations: `npm run migrate`
5. Start development: `npm run dev`

## References

- Golden Path Documentation: `/golden-path/GOLDEN_PATH.md`
- Traycer Integration Guide: `/golden-path/docs/guides/traycer-integration.md`
- Template Structure: `/golden-path/templates/fullstack-todo/`

