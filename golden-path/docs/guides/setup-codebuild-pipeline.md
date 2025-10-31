# AWS CodeBuild and CodePipeline Setup Guide

This guide covers setting up AWS CodeBuild and CodePipeline for automated CI/CD in your golden path project.

## Prerequisites

- GitHub or AWS CodeCommit repository
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Docker installed (for local testing)

## CodeBuild Project Creation

### Frontend Build Project

Create a CodeBuild project for the frontend:

```bash
aws codebuild create-project \
  --name todoapp-frontend-build \
  --source type=GITHUB,location=https://github.com/your-org/todoapp.git \
  --artifacts type=S3,location=s3://your-build-artifacts-bucket/frontend \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::account-id:role/codebuild-role
```

### Backend Build Project

Create a CodeBuild project for the backend:

```bash
aws codebuild create-project \
  --name todoapp-backend-build \
  --source type=GITHUB,location=https://github.com/your-org/todoapp.git \
  --artifacts type=S3,location=s3://your-build-artifacts-bucket/backend \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::account-id:role/codebuild-role
```

## Buildspec Configuration

### Root Buildspec

The root buildspec orchestrates the entire build process:

**Location**: `/golden-path/templates/fullstack-todo/.aws/buildspec.yml`

```yaml
version: 0.2
phases:
  install:
    commands:
      - echo Installing dependencies...
  pre_build:
    commands:
      - echo Running pre-build checks...
  build:
    commands:
      - echo Building application...
  post_build:
    commands:
      - echo Build completed
artifacts:
  files:
    - '**/*'
```

### Frontend Buildspec

**Location**: `/golden-path/templates/fullstack-todo/.aws/buildspec-frontend.yml`

```yaml
version: 0.2
phases:
  install:
    commands:
      - cd frontend
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm run test
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - echo Frontend build completed
artifacts:
  files:
    - 'frontend/dist/**/*'
  base-directory: frontend
```

### Backend Buildspec

**Location**: `/golden-path/templates/fullstack-todo/.aws/buildspec-backend.yml`

```yaml
version: 0.2
phases:
  install:
    commands:
      - cd backend
      - npm ci
  pre_build:
    commands:
      - npm run lint
      - npm run test
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - echo Backend build completed
artifacts:
  files:
    - 'backend/**/*'
  base-directory: backend
```

## CodePipeline Setup

### Pipeline Stages

A typical pipeline includes these stages:

1. **Source**: Fetch code from GitHub/CodeCommit
2. **Build**: Compile and test the application
3. **Test**: Run E2E tests with QA Wolf
4. **Deploy**: Deploy to staging/production

### Using the Setup Script

The golden path includes an automated setup script:

```bash
cd golden-path/scripts
chmod +x setup-aws-pipeline.sh
./setup-aws-pipeline.sh
```

**Location**: `/golden-path/scripts/setup-aws-pipeline.sh`

The script will:
- Prompt for AWS region and account details
- Validate AWS CLI installation and credentials
- Create CodePipeline using CloudFormation template
- Set up source connection (GitHub or CodeCommit)
- Configure CodeBuild projects
- Create necessary IAM roles and policies
- Set up SNS notifications
- Output pipeline URL and status

### Manual Pipeline Creation

#### CloudFormation Template

**Location**: `/golden-path/templates/fullstack-todo/.aws/cloudformation/pipeline.yml`

Create the pipeline using CloudFormation:

```bash
aws cloudformation create-stack \
  --stack-name todoapp-pipeline \
  --template-body file://.aws/cloudformation/pipeline.yml \
  --parameters ParameterKey=GitHubRepo,ParameterValue=your-org/todoapp \
               ParameterKey=GitHubBranch,ParameterValue=main \
               ParameterKey=GitHubToken,ParameterValue=your-github-token \
  --capabilities CAPABILITY_NAMED_IAM
```

### Source Connection

#### GitHub Connection

1. Use AWS CodeStar Connections to connect to GitHub
2. Authorize AWS to access your GitHub repositories
3. Use the connection ARN in your pipeline configuration

```bash
aws codestar-connections create-connection \
  --provider-type GitHub \
  --connection-name github-connection
```

#### CodeCommit Alternative

If using CodeCommit:

```bash
aws codecommit create-repository \
  --repository-name todoapp

# Push your code to CodeCommit
git remote add codecommit https://git-codecommit.region.amazonaws.com/v1/repos/todoapp
git push codecommit main
```

## Environment Variables and Secrets

### Setting Environment Variables

Configure CodeBuild environment variables:

```bash
aws codebuild update-project \
  --name todoapp-frontend-build \
  --environment environmentVariables=[
    {name=NODE_ENV,value=production},
    {name=API_URL,value=https://api.todoapp.com}
  ]
```

### Using Secrets Manager

Reference secrets in buildspec:

```yaml
version: 0.2
env:
  secrets-manager:
    DB_PASSWORD: todoapp/database/credentials:password
    JWT_SECRET: todoapp/jwt/secret
phases:
  build:
    commands:
      - echo Building with secrets...
```

## Artifact Management

### S3 Bucket Setup

Create S3 buckets for build artifacts:

```bash
aws s3 mb s3://todoapp-build-artifacts
aws s3api put-bucket-versioning \
  --bucket todoapp-build-artifacts \
  --versioning-configuration Status=Enabled
```

### Artifact Policies

Configure lifecycle policies to manage artifact retention:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket todoapp-build-artifacts \
  --lifecycle-configuration file://lifecycle-policy.json
```

## Integrating QA Wolf E2E Tests

### Pipeline Stage

Add an E2E test stage to your pipeline:

```yaml
- Name: E2ETests
  Actions:
    - Name: RunE2ETests
      ActionTypeId:
        Category: Test
        Owner: AWS
        Provider: CodeBuild
        Version: '1'
      Configuration:
        ProjectName: todoapp-e2e-tests
      InputArtifacts:
        - Name: BuildArtifact
```

### E2E Test Project

Create a CodeBuild project for E2E tests:

```bash
aws codebuild create-project \
  --name todoapp-e2e-tests \
  --source type=GITHUB,location=https://github.com/your-org/todoapp.git \
  --environment type=LINUX_CONTAINER,image=node:18 \
  --buildspec file://tests/e2e/buildspec.yml
```

**Reference**: `/golden-path/templates/fullstack-todo/tests/e2e/playwright.config.js`

## Deployment Strategies

### Blue-Green Deployment

Deploy to a new environment, then switch traffic:

1. Build new version
2. Deploy to green environment
3. Run smoke tests
4. Switch load balancer to green
5. Monitor and rollback if needed

### Rolling Deployment

Gradually replace instances:

1. Deploy to subset of instances
2. Verify health
3. Continue deployment to remaining instances
4. Monitor throughout process

### Canary Deployment

Deploy to small subset first:

1. Deploy to 10% of instances
2. Monitor metrics
3. Gradually increase to 100%
4. Rollback if issues detected

## Monitoring Pipeline Execution

### CloudWatch Logs

CodeBuild automatically sends logs to CloudWatch:

```bash
aws logs tail /aws/codebuild/todoapp-frontend-build --follow
```

### SNS Notifications

Set up notifications for pipeline events:

```bash
aws sns create-topic --name pipeline-notifications

aws codepipeline put-webhook \
  --webhook name=pipeline-webhook \
  --target-pipeline todoapp-pipeline \
  --target-action SourceAction \
  --filters '[{"jsonPath":"$.ref","matchEquals":"refs/heads/main"}]'
```

### Pipeline Status Dashboard

Create a CloudWatch dashboard:

```bash
aws cloudwatch put-dashboard \
  --dashboard-name pipeline-status \
  --dashboard-body file://dashboard.json
```

## Troubleshooting

### Build Failures

**Common Issues:**

1. **Out of Memory**
   - Increase compute type (e.g., BUILD_GENERAL1_MEDIUM)
   - Optimize build process

2. **Timeout Errors**
   - Increase build timeout
   - Optimize slow operations

3. **Permission Errors**
   - Verify IAM role permissions
   - Check S3 bucket policies

4. **Dependency Installation Failures**
   - Check npm/yarn registry connectivity
   - Verify package.json is valid
   - Check for private package access

### Pipeline Issues

**Pipeline Not Triggering:**
- Verify webhook configuration
- Check source connection status
- Verify branch names match

**Artifacts Not Found:**
- Check artifact names match
- Verify S3 bucket permissions
- Check artifact paths in buildspec

**Deployment Failures:**
- Check IAM permissions for ECS/Lambda
- Verify environment variables
- Check CloudFormation template validity

### Using the Setup Script

If you encounter issues with the setup script:

1. Check AWS CLI credentials: `aws sts get-caller-identity`
2. Verify region is correct
3. Check CloudFormation stack events for errors
4. Review CloudWatch logs for detailed errors

## Best Practices

- **Use separate pipelines** for different branches (dev, staging, prod)
- **Implement approval gates** for production deployments
- **Set up rollback procedures** for failed deployments
- **Monitor pipeline metrics** (duration, success rate)
- **Use versioned artifacts** for traceability
- **Implement security scanning** in build phase
- **Automate database migrations** in deployment phase
- **Use infrastructure as code** (CloudFormation/Terraform)

## Additional Resources

- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/)
- [Buildspec Reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [Pipeline Best Practices](https://docs.aws.amazon.com/codepipeline/latest/userguide/best-practices.html)
