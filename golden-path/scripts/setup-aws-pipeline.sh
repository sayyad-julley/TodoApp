#!/bin/bash

# setup-aws-pipeline.sh
# AWS CodePipeline setup script for golden path projects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Get AWS details
get_aws_details() {
    echo ""
    read -p "Enter AWS region (default: us-east-1): " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    log_info "AWS Account ID: $AWS_ACCOUNT_ID"
    log_info "AWS Region: $AWS_REGION"
    
    echo ""
    read -p "Enter GitHub repository (format: owner/repo, e.g., myorg/myapp): " GITHUB_REPO
    
    if [ -z "$GITHUB_REPO" ]; then
        log_error "GitHub repository cannot be empty"
        exit 1
    fi
    
    read -p "Enter GitHub branch (default: main): " GITHUB_BRANCH
    GITHUB_BRANCH=${GITHUB_BRANCH:-main}
    
    read -p "Enter GitHub token (or leave empty to use CodeStar connection): " GITHUB_TOKEN
    
    read -p "Enter CodeStar connection ARN (if using, leave empty for token): " CODESTAR_CONNECTION_ARN
}

# Create S3 bucket for artifacts
create_artifacts_bucket() {
    log_info "Creating S3 bucket for build artifacts..."
    
    BUCKET_NAME="${PROJECT_NAME}-build-artifacts-${AWS_ACCOUNT_ID}"
    
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        log_warning "S3 bucket already exists: $BUCKET_NAME"
    else
        aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled
        log_success "S3 bucket created: $BUCKET_NAME"
    fi
}

# Create CodeStar connection (if needed)
create_codestar_connection() {
    if [ -n "$CODESTAR_CONNECTION_ARN" ]; then
        log_info "Using existing CodeStar connection: $CODESTAR_CONNECTION_ARN"
        return
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        log_info "Creating CodeStar connection for GitHub..."
        read -p "Enter connection name (default: github-connection): " CONNECTION_NAME
        CONNECTION_NAME=${CONNECTION_NAME:-github-connection}
        
        CODESTAR_CONNECTION_ARN=$(aws codestar-connections create-connection \
            --provider-type GitHub \
            --connection-name "$CONNECTION_NAME" \
            --query ConnectionArn \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$CODESTAR_CONNECTION_ARN" ]; then
            log_warning "CodeStar connection created but requires manual approval:"
            echo "  Please approve the connection at: https://console.aws.amazon.com/codesuite/settings/connections"
            echo "  Connection ARN: $CODESTAR_CONNECTION_ARN"
        fi
    fi
}

# Deploy CloudFormation stack
deploy_pipeline_stack() {
    log_info "Deploying CodePipeline CloudFormation stack..."
    
    if [ ! -f ".aws/cloudformation/pipeline.yml" ]; then
        log_error "Pipeline CloudFormation template not found: .aws/cloudformation/pipeline.yml"
        exit 1
    fi
    
    STACK_NAME="${PROJECT_NAME}-pipeline"
    
    # Prepare parameters
    PARAMETERS="ParameterKey=GitHubRepo,ParameterValue=$GITHUB_REPO \
                ParameterKey=GitHubBranch,ParameterValue=$GITHUB_BRANCH \
                ParameterKey=ProjectName,ParameterValue=$PROJECT_NAME \
                ParameterKey=ArtifactsBucket,ParameterValue=$BUCKET_NAME"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        PARAMETERS="$PARAMETERS ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN"
    fi
    
    if [ -n "$CODESTAR_CONNECTION_ARN" ]; then
        PARAMETERS="$PARAMETERS ParameterKey=CodeStarConnectionArn,ParameterValue=$CODESTAR_CONNECTION_ARN"
    fi
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" &> /dev/null; then
        log_warning "Stack already exists. Updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://.aws/cloudformation/pipeline.yml \
            --parameters $PARAMETERS \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    else
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://.aws/cloudformation/pipeline.yml \
            --parameters $PARAMETERS \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    fi
    
    log_info "Waiting for stack deployment..."
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION" || \
    aws cloudformation wait stack-update-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION"
    
    log_success "Pipeline stack deployed"
}

# Set up SNS notifications
setup_sns_notifications() {
    log_info "Setting up SNS notifications..."
    
    TOPIC_NAME="${PROJECT_NAME}-pipeline-notifications"
    TOPIC_ARN=$(aws sns create-topic --name "$TOPIC_NAME" --region "$AWS_REGION" --query TopicArn --output text 2>/dev/null || \
                aws sns list-topics --region "$AWS_REGION" --query "Topics[?contains(TopicArn, '$TOPIC_NAME')].TopicArn" --output text | head -n1)
    
    if [ -z "$TOPIC_ARN" ]; then
        log_error "Failed to create/find SNS topic"
        return
    fi
    
    log_success "SNS topic created: $TOPIC_ARN"
    log_info "Please subscribe to the topic at: https://console.aws.amazon.com/sns/v3/home"
}

# Display pipeline information
display_pipeline_info() {
    echo ""
    log_success "AWS CodePipeline setup completed!"
    echo ""
    echo "Pipeline Information:"
    echo "  Stack Name: ${PROJECT_NAME}-pipeline"
    echo "  Region: $AWS_REGION"
    echo "  GitHub Repo: $GITHUB_REPO"
    echo "  Branch: $GITHUB_BRANCH"
    echo ""
    echo "View Pipeline:"
    echo "  https://${AWS_REGION}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${PROJECT_NAME}-pipeline/view"
    echo ""
    echo "Next Steps:"
    echo "  1. Approve CodeStar connection (if created)"
    echo "  2. Push code to GitHub repository"
    echo "  3. Pipeline will automatically trigger on push"
    echo "  4. Monitor pipeline execution in AWS Console"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check CloudFormation stack events for errors"
    echo "  - Verify IAM permissions"
    echo "  - Review CloudWatch logs"
    echo ""
}

# Main execution
main() {
    PROJECT_NAME=$(basename "$(pwd)")
    
    echo "════════════════════════════════════════════════════════"
    echo "  AWS CodePipeline Setup"
    echo "════════════════════════════════════════════════════════"
    
    check_prerequisites
    get_aws_details
    
    echo ""
    log_info "Setting up pipeline for project: $PROJECT_NAME"
    echo ""
    
    create_artifacts_bucket
    create_codestar_connection
    deploy_pipeline_stack
    setup_sns_notifications
    display_pipeline_info
}

# Run main function
main "$@"
