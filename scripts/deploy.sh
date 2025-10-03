#!/bin/bash

# RealBrand Pro Deployment Script
# Supports blue-green deployments, health checks, and rollbacks

set -e

# Configuration
NAMESPACE=${NAMESPACE:-realbrand-pro}
IMAGE_TAG=${IMAGE_TAG:-latest}
ENVIRONMENT=${ENVIRONMENT:-production}
BACKUP_RETENTION=${BACKUP_RETENTION:-7}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Function to check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Function to validate prerequisites
validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_warning "Namespace $NAMESPACE does not exist, creating..."
        kubectl create namespace "$NAMESPACE"
        kubectl label namespace "$NAMESPACE" environment="$ENVIRONMENT"
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites validated"
}

# Function to backup current deployment
backup_deployment() {
    log "Creating deployment backup..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup current Kubernetes resources
    kubectl get all -n "$NAMESPACE" -o yaml > "$backup_dir/k8s-resources.yaml"
    kubectl get configmaps -n "$NAMESPACE" -o yaml > "$backup_dir/configmaps.yaml"
    kubectl get secrets -n "$NAMESPACE" -o yaml > "$backup_dir/secrets.yaml"
    
    log_success "Deployment backup created: $backup_dir"
    
    # Clean up old backups
    find backups/ -type d -name "20*" | sort | head -n -$BACKUP_RETENTION | xargs rm -rf
}

# Function to build Docker image
build_image() {
    log "Building Docker image..."
    
    local image_name="ghcr.io/realbrand/realbrand-pro:$IMAGE_TAG"
    
    # Build the image
    if docker build -t "$image_name" .; then
        log_success "Docker image built successfully"
    else
        log_error "Docker image build failed"
        exit 1
    fi
    
    # Push the image
    if docker push "$image_name"; then
        log_success "Docker image pushed successfully"
    else
        log_error "Docker image push failed"
        exit 1
    fi
}

# Function to update ConfigMaps and Secrets
update_configs() {
    log "Updating ConfigMaps and Secrets..."
    
    # Apply ConfigMaps
    if kubectl apply -f k8s/configmaps.yaml; then
        log_success "ConfigMaps updated"
    else
        log_error "ConfigMaps update failed"
        exit 1
    fi
    
    # Apply Secrets (if they exist)
    if [[ -f "k8s/secrets.yaml" ]]; then
        if kubectl apply -f k8s/secrets.yaml; then
            log_success "Secrets updated"
        else
            log_error "Secrets update failed"
            exit 1
        fi
    fi
}

# Function for blue-green deployment
deploy_blue_green() {
    log "Starting blue-green deployment..."
    
    # Determine current color
    local current_color
    if kubectl get deployment realbrand-frontend-blue -n "$NAMESPACE" &> /dev/null; then
        current_color="blue"
        new_color="green"
    else
        current_color="green"
        new_color="blue"
    fi
    
    log "Current deployment: $current_color"
    log "Deploying to: $new_color"
    
    # Deploy new version
    kubectl apply -f k8s/deployments-$new_color.yaml
    
    # Wait for deployment to be ready
    log "Waiting for new deployment to be ready..."
    if kubectl rollout status deployment/realbrand-frontend-$new_color -n "$NAMESPACE" --timeout=300s; then
        log_success "New deployment is ready"
    else
        log_error "New deployment failed to become ready"
        exit 1
    fi
    
    # Switch traffic
    log "Switching traffic to new deployment..."
    kubectl patch service realbrand-frontend-service -n "$NAMESPACE" -p '{
        "spec": {
            "selector": {
                "app": "realbrand-frontend",
                "color": "'$new_color'"
            }
        }
    }'
    
    # Health check
    local service_url="http://$(kubectl get service realbrand-frontend-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
    if curl -sf "$service_url/api/health" > /dev/null; then
        log_success "Health check passed"
        
        # Keep old deployment for quick rollback
        log "Old deployment kept for rollback purposes"
    else
        log_error "Health check failed"
        log_warning "Rolling back traffic to previous deployment..."
        
        # Rollback traffic
        kubectl patch service realbrand-frontend-service -n "$NAMESPACE" -p '{
            "spec": {
                "selector": {
                    "app": "realbrand-frontend",
                    "color": "'$current_color'"
                }
            }
        }'
        
        exit 1
    fi
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Create migration job
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ghcr.io/realbrand/realbrand-pro:$IMAGE_TAG
        command: ["npm", "run", "db:migrate"]
        envFrom:
        - secretRef:
            name: realbrand-secrets
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    # Wait for migration to complete
    local job_name=$(kubectl get jobs -n "$NAMESPACE" -o jsonpath='{.items[-1].metadata.name}')
    kubectl wait --for=condition=complete job/"$job_name" -n "$NAMESPACE" --timeout=300s
    
    if kubectl get job "$job_name" -n "$NAMESPACE" -o jsonpath='{.status.conditions[0].type}' | grep -q "Complete"; then
       <｜tool▁sep｜> log_success "Database migrations completed successfully"
        
        # Clean up migration job
        kubectl delete job "$job_name" -n "$NAMESPACE"
    else
        log_error "Database migrations failed"
        exit 1
    fi
}

# Function to run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    local service_url="http://$(kubectl get service realbrand-frontend-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
    
    # Create test job
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: smoke-tests-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: smoke-tests
        image: ghcr.io/realbrand/realbrand-pro:$IMAGE_TAG
        command: ["npm", "run", "test:smoke"]
        env:
        - name: APP_URL
          value: "$service_url"
        envFrom:
        - secretRef:
            name: realbrand-secrets
      restartPolicy: Never
  backoffLimit: 2
EOF
    
    # Wait for tests to complete
    local job_name=$(kubectl get jobs -n "$NAMESPACE" -o jsonpath='{.items[-1].metadata.name}')
    kubectl wait --for=condition=complete job/"$job_name" -n "$NAMESPACE" --timeout=300s
    
    if kubectl get job "$job_name" -n "$NAMESPACE" -o jsonpath='{.status.conditions[0].type}' | grep -q "Complete"; then
        log_success "Smoke tests passed"
        
        # Clean up test job
        kubectl delete job "$job_name" -n "$NAMESPACE"
    else
        log_error "Smoke tests failed"
        kubectl logs job/"$job_name" -n "$NAMESPACE"
        exit 1
    fi
}

# Function to clean up old deployments
cleanup_old_deployments() {
    log "Cleaning up old deployments..."
    
    # List all deployments older than 2 hours
    kubectl get deployments -n "$NAMESPACE" -o json | jq -r '.items[] | select(.metadata.creationTimestamp | fromdate < now - 7200) | .metadata.name' | while read deployment; do
        log "Deleting old deployment: $deployment"
        kubectl delete deployment "$deployment" -n "$NAMESPACE"
    done
    
    log_success "Cleanup completed"
}

# Function to send notifications
send_notification() {
    local status=$1
    local message=$2
    
    # Webhook notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (if configured)
    if [[ -n "$NOTIFICATION_EMAIL" ]]; then
        echo "Deployment $status: $message at $(date)" | mail -s "RealBrand Pro Deployment Update" "$NOTIFICATION_EMAIL"
    fi
}

# Function to rollback deployment
rollback_deployment() {
    log_error "Deployment failed, initiating rollback..."
    
    # Rollback to previous deployment
    kubectl rollout undo deployment/realbrand-frontend -n "$NAMESPACE"
    
    if kubectl rollout status deployment/realbrand-frontend -n "$NAMESPACE" --timeout=300s; then
        log_success "Rollback completed successfully"
        send_notification "ROLLED BACK" "Deployment rolled back successfully"
    else
        log_error "Rollback failed"
        send_notification "ROLLBACK FAILED" "Deployment rollback failed"
        exit 1
    fi
}

# Main deployment function
deploy() {
    local start_time=$(date +%s)
    
    log "Starting deployment to $ENVIRONMENT environment..."
    log "Namespace: $NAMESPACE"
    log "Image Tag: $IMAGE_TAG"
    
    # Pre-deployment steps
    validate_prerequisites
    backup_deployment
    
    # Build and push image if building locally
    if [[ "$BUILD_LOCAL" == "true" ]]; then
        build_image
    fi
    
    # Update configuration
    update_configs
    
    # Run database migrations
    run_migrations
    
    # Deploy application
    if [[ "$DEPLOYMENT_TYPE" == "blue-green" ]]; then
        deploy_blue_green
    else
        # Standard rolling update
        kubectl apply -f k8s/deployments.yaml
        kubectl rollout status deployment/realbrand-frontend -n "$NAMESPACE" --timeout=300s
    fi
    
    # Post-deployment steps
    run_smoke_tests
    cleanup_old_deployments
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Deployment completed successfully in ${duration}s"
    send_notification "SUCCESS" "Deployment completed successfully in ${duration} seconds"
}

# Command line argument parsing
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback_deployment
        ;;
    "health-check")
        kubectl get all -n "$NAMESPACE"
        ;;
    "logs")
        kubectl logs -f deployment/realbrand-frontend -n "$NAMESPACE"
        ;;
    "status")
        kubectl rollout status deployment/realbrand-frontend -n "$NAMESPACE"
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|logs|status}"
        echo ""
        echo "Environment Variables:"
        echo "  NAMESPACE          Kubernetes namespace (default: realbrand-pro)"
        echo "  IMAGE_TAG          Docker image tag (default: latest)"
        echo "  ENVIRONMENT        Deployment environment (default: production)"
        echo "  DEPLOYMENT_TYPE    Deployment type: blue-green or rolling (default: rolling)"
        echo "  BUILD_LOCAL        Build and push image locally (true/false)"
        echo "  SLACK_WEBHOOK_URL  Slack webhook for notifications"
        echo "  NOTIFICATION_EMAIL Email for notifications"
        exit 1
        ;;
esac
