#!/bin/bash

# validate-template.sh
# Template validation script for golden path templates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOLDEN_PATH_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$GOLDEN_PATH_DIR/templates"

# Validation results
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((VALIDATION_WARNINGS++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((VALIDATION_ERRORS++))
}

# Check if file exists
check_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        log_success "$description: $file"
        return 0
    else
        log_error "$description: $file (missing)"
        return 1
    fi
}

# Check if directory exists
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        log_success "$description: $dir"
        return 0
    else
        log_error "$description: $dir (missing)"
        return 1
    fi
}

# Validate JSON file
validate_json() {
    local file="$1"
    
    if [ -f "$file" ]; then
        if command -v jq &> /dev/null; then
            if jq empty "$file" 2>/dev/null; then
                log_success "JSON valid: $file"
            else
                log_error "JSON invalid: $file"
            fi
        else
            log_warning "jq not installed, skipping JSON validation for: $file"
        fi
    fi
}

# Validate YAML file
validate_yaml() {
    local file="$1"
    
    if [ -f "$file" ]; then
        if command -v yamllint &> /dev/null; then
            if yamllint "$file" &> /dev/null; then
                log_success "YAML valid: $file"
            else
                log_error "YAML invalid: $file"
            fi
        else
            log_warning "yamllint not installed, skipping YAML validation for: $file"
        fi
    fi
}

# Validate CloudFormation template
validate_cloudformation() {
    local file="$1"
    
    if [ -f "$file" ] && command -v aws &> /dev/null; then
        if aws cloudformation validate-template --template-body "file://$file" &> /dev/null; then
            log_success "CloudFormation valid: $file"
        else
            log_error "CloudFormation invalid: $file"
            aws cloudformation validate-template --template-body "file://$file" 2>&1 | head -n 10
        fi
    elif [ -f "$file" ]; then
        log_warning "AWS CLI not installed, skipping CloudFormation validation for: $file"
    fi
}

# Check for placeholder values
check_placeholders() {
    local file="$1"
    local placeholders=("todoapp-golden-path" "TodoApp Golden Path" "todoapp")
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    for placeholder in "${placeholders[@]}"; do
        if grep -q "$placeholder" "$file" 2>/dev/null; then
            log_warning "Placeholder found in $file: $placeholder"
        fi
    done
}

# Validate template structure
validate_template_structure() {
    local template_dir="$1"
    local template_name=$(basename "$template_dir")
    
    log_info "Validating template structure: $template_name"
    echo ""
    
    # Required files
    check_file "$template_dir/package.json" "Root package.json"
    check_file "$template_dir/README.md" "README.md"
    check_file "$template_dir/.gitignore" ".gitignore"
    
    # Required directories
    check_directory "$template_dir/frontend" "Frontend directory"
    check_directory "$template_dir/backend" "Backend directory"
    check_directory "$template_dir/.aws" "AWS directory"
    
    # Frontend files
    if [ -d "$template_dir/frontend" ]; then
        check_file "$template_dir/frontend/package.json" "Frontend package.json"
        check_file "$template_dir/frontend/vite.config.js" "Frontend vite.config.js"
    fi
    
    # Backend files
    if [ -d "$template_dir/backend" ]; then
        check_file "$template_dir/backend/package.json" "Backend package.json"
        check_file "$template_dir/backend/server.js" "Backend server.js"
    fi
    
    # AWS files
    if [ -d "$template_dir/.aws" ]; then
        check_file "$template_dir/.aws/buildspec.yml" "Root buildspec.yml"
        check_file "$template_dir/.aws/buildspec-frontend.yml" "Frontend buildspec.yml"
        check_file "$template_dir/.aws/buildspec-backend.yml" "Backend buildspec.yml"
        check_directory "$template_dir/.aws/cloudformation" "CloudFormation directory"
        
        if [ -d "$template_dir/.aws/cloudformation" ]; then
            validate_cloudformation "$template_dir/.aws/cloudformation/pipeline.yml"
            validate_cloudformation "$template_dir/.aws/cloudformation/infrastructure.yml"
            validate_cloudformation "$template_dir/.aws/cloudformation/monitoring.yml"
        fi
    fi
    
    # Configuration files
    if [ -f "$template_dir/.eslintrc.json" ]; then
        validate_json "$template_dir/.eslintrc.json"
    fi
    
    if [ -f "$template_dir/.prettierrc.json" ]; then
        validate_json "$template_dir/.prettierrc.json"
    fi
    
    if [ -f "$template_dir/mint.json" ]; then
        validate_json "$template_dir/mint.json"
    fi
    
    # Check for placeholder values in key files
    log_info "Checking for placeholder values..."
    check_placeholders "$template_dir/package.json"
    check_placeholders "$template_dir/README.md"
    if [ -f "$template_dir/frontend/package.json" ]; then
        check_placeholders "$template_dir/frontend/package.json"
    fi
    if [ -f "$template_dir/backend/package.json" ]; then
        check_placeholders "$template_dir/backend/package.json"
    fi
}

# Run linting
run_linting() {
    local template_dir="$1"
    
    log_info "Running linting checks..."
    
    if [ -f "$template_dir/.eslintrc.json" ] && command -v eslint &> /dev/null; then
        if [ -d "$template_dir/frontend" ]; then
            cd "$template_dir/frontend"
            if npm run lint &> /dev/null; then
                log_success "Frontend linting passed"
            else
                log_error "Frontend linting failed"
            fi
            cd - &> /dev/null
        fi
        
        if [ -d "$template_dir/backend" ]; then
            cd "$template_dir/backend"
            if npm run lint &> /dev/null; then
                log_success "Backend linting passed"
            else
                log_error "Backend linting failed"
            fi
            cd - &> /dev/null
        fi
    else
        log_warning "ESLint not configured or not installed, skipping linting"
    fi
}

# Run template tests
run_tests() {
    local template_dir="$1"
    
    log_info "Running template tests..."
    
    if [ -f "$template_dir/package.json" ]; then
        cd "$template_dir"
        
        if grep -q "\"test\"" package.json; then
            if npm test &> /dev/null; then
                log_success "Template tests passed"
            else
                log_error "Template tests failed"
            fi
        else
            log_warning "No test script found in package.json"
        fi
        
        cd - &> /dev/null
    fi
}

# Generate validation report
generate_report() {
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "  Validation Report"
    echo "════════════════════════════════════════════════════════"
    echo ""
    echo "Errors: $VALIDATION_ERRORS"
    echo "Warnings: $VALIDATION_WARNINGS"
    echo ""
    
    if [ $VALIDATION_ERRORS -eq 0 ] && [ $VALIDATION_WARNINGS -eq 0 ]; then
        log_success "Template validation passed!"
        return 0
    elif [ $VALIDATION_ERRORS -eq 0 ]; then
        log_warning "Template validation passed with warnings"
        return 0
    else
        log_error "Template validation failed with $VALIDATION_ERRORS error(s)"
        return 1
    fi
}

# Main execution
main() {
    local template_name="${1:-fullstack-todo}"
    local template_dir="$TEMPLATES_DIR/$template_name"
    
    echo "════════════════════════════════════════════════════════"
    echo "  Template Validation"
    echo "════════════════════════════════════════════════════════"
    echo ""
    
    if [ ! -d "$template_dir" ]; then
        log_error "Template not found: $template_dir"
        exit 1
    fi
    
    validate_template_structure "$template_dir"
    echo ""
    run_linting "$template_dir"
    echo ""
    run_tests "$template_dir"
    
    generate_report
}

# Run main function
main "$@"
