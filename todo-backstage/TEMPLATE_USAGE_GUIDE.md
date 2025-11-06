# How to Use the Full-Stack Todo Application Template in Backstage

This guide explains the step-by-step process of creating a new project using the Full-Stack Todo Application Template in Backstage.

## Overview

The Full-Stack Todo Application Template allows you to create a production-ready todo application with:
- React 18 frontend with TypeScript and Vite
- Node.js/Express backend with MongoDB
- JWT authentication and authorization
- Docker containerization
- AWS X-Ray distributed tracing
- Comprehensive testing setup
- Production-ready deployment configuration

## Prerequisites

Before using the template, ensure:
- You have access to a running Backstage instance
- You have appropriate permissions to create repositories
- GitHub/GitLab credentials are configured in Backstage
- You know the target repository location where your project will be created

## Step-by-Step Process

### Step 1: Access the Create Page

1. **Navigate to the Create Page**
   - In your Backstage instance, go to the **"Create..."** option in the left sidebar
   - Or directly navigate to `/create` route (typically `http://localhost:3000/create`)

2. **View Available Templates**
   - You'll see a list of available software templates
   - Look for **"Full-Stack Todo Application Template"** in the template list

### Step 2: Select the Template

1. **Click on the Template**
   - Click on the **"Full-Stack Todo Application Template"** card
   - You'll see the template details including:
     - Description of what the template includes
     - Technology stack information
     - Tags (todo, react, nodejs, mongodb, jwt, docker, etc.)

2. **Review Template Information**
   - Read the template description to ensure it meets your needs
   - Check the included features and technologies
   - Click **"CHOOSE"** button to proceed

### Step 3: Fill in Project Information

After selecting the template, you'll be presented with a multi-step form. The first step is **"Project Information"**:

#### Required Fields:

1. **Project Name**
   - Enter a unique name for your project (e.g., `my-todo-app`)
   - Rules:
     - Use lowercase letters, numbers, and hyphens only
     - Must start with a lowercase letter or number
     - Examples: `my-todo-app`, `todo-app-v2`, `personal-todo`
   - This field has auto-focus for quick entry

2. **Description**
   - Provide a brief description of your todo application
   - This will be used in:
     - Repository README
     - Backstage catalog entry
     - Project documentation
   - Example: "A comprehensive todo application for personal task management"

3. **Owner**
   - Select the owner of the component (user or team)
   - Use the Owner Picker to select from:
     - Individual users
     - Teams/groups
   - This determines who has ownership and access to the component

#### Optional Fields (if applicable):

- Any additional configuration options specific to your template variant

### Step 4: Configure Repository Location

The second step is **"Repository Configuration"**:

1. **Repository Location**
   - Use the Repository URL Picker to specify where your code will be stored
   - Supported platforms:
     - GitHub.com
     - GitLab.com
   - Format: `github.com?owner=your-org&repo=your-repo-name`
   - Or select from existing repositories if integrated

2. **Repository Details**
   - The repository will be created automatically if it doesn't exist
   - Default branch will be set to `main`
   - Initial commit message will be: "Initial commit: Created from Full-Stack Todo Application Template"

### Step 5: Review and Create

1. **Review Step**
   - Review all the information you've entered:
     - Project name
     - Description
     - Owner
     - Repository location
   - Ensure all details are correct before proceeding

2. **Execute the Template**
   - Click the **"Create"** or **"Execute"** button
   - The template execution will begin

### Step 6: Monitor Template Execution

Backstage will execute the template through several automated steps:

1. **Fetch Base Template**
   - Downloads/clones the template skeleton
   - Replaces placeholders with your provided values
   - Sets up the project structure

2. **Publish to Repository**
   - Creates the repository on GitHub/GitLab
   - Pushes all generated files
   - Sets up the initial commit

3. **Register Component**
   - Registers the new component in the Backstage catalog
   - Creates a catalog-info.yaml entry
   - Makes the component discoverable in Backstage

4. **Notify User**
   - Sends a notification that the project was created successfully
   - Includes links to the repository and catalog entry

### Step 7: Access Your New Project

After successful execution, you'll see output links:

1. **Repository Link**
   - Direct link to your newly created GitHub/GitLab repository
   - Click to view the code and project structure

2. **Open in Catalog**
   - Link to view the component in the Backstage catalog
   - See component details, relationships, and documentation

3. **View TechDocs**
   - Link to view the generated documentation
   - Access project documentation and guides

## What Gets Created

The template generates a complete project structure:

```
your-project-name/
├── README.md                    # Project documentation
├── catalog-info.yaml           # Backstage catalog entry
├── package.json                 # Root package configuration
├── docker-compose.yml          # Local development setup
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React contexts
│   │   └── utils/              # Utility functions
│   └── package.json
├── backend/                     # Node.js backend
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   ├── models/             # Data models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   └── config/             # Configuration files
│   └── package.json
├── database/                    # Database migrations
│   └── migrations/
└── docs/                        # Documentation (TechDocs)
    ├── index.md
    └── mkdocs.yml
```

## Next Steps After Creation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <your-project-name>
   ```

2. **Set Up Local Development**
   - Follow the README.md instructions
   - Set up environment variables
   - Install dependencies
   - Run the development server

3. **Review the Documentation**
   - Check the TechDocs for detailed guides
   - Review API documentation
   - Understand the architecture

4. **Start Development**
   - Begin implementing features
   - Run tests
   - Deploy to your environment

## Troubleshooting

### Template Execution Fails

- **Check Backstage Logs**: Review backend logs for error details
- **Verify Permissions**: Ensure you have rights to create repositories
- **Check Repository URL**: Verify the repository location is correct and accessible
- **Review Parameters**: Ensure all required fields are filled correctly

### Component Not Appearing in Catalog

- Wait a few moments for catalog refresh
- Check the catalog registration step completed successfully
- Verify the catalog-info.yaml file was created correctly

### Repository Not Created

- Verify GitHub/GitLab integration is configured
- Check authentication tokens are valid
- Ensure repository name is unique and follows naming conventions

## Additional Resources

- [Backstage Software Templates Documentation](https://backstage.io/docs/features/software-templates/)
- [Template Writing Guide](https://backstage.io/docs/features/software-templates/writing-templates/)
- Project README.md for project-specific setup instructions

## Support

For issues or questions:
- Check Backstage documentation
- Review template logs in Backstage UI
- Contact your platform team or Backstage administrator

