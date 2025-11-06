# Deployment

This guide covers deploying the Full-Stack Todo Application Template to production.

## Prerequisites

- Docker and Docker Compose installed
- AWS account (for AWS deployment)
- Domain name (optional)
- SSL certificate (for HTTPS)

## Docker Deployment

### Build and Run

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/my_todo_app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com

# AWS X-Ray (Optional)
ENABLE_XRAY=true
SERVICE_NAME=todo-api
AWS_XRAY_DAEMON_ADDRESS=xray-daemon:2000
```

## AWS Deployment

### AWS ECS Deployment

1. **Build Docker Images**:
```bash
docker build -t my-todo-backend -f Dockerfile.backend .
docker build -t my-todo-frontend -f Dockerfile.frontend .
```

2. **Push to ECR**:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag my-todo-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/my-todo-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/my-todo-backend:latest
```

3. **Create ECS Task Definition**:
   - Define containers for backend, frontend, MongoDB, and X-Ray daemon
   - Configure environment variables
   - Set up networking and security groups

4. **Deploy to ECS**:
   - Create ECS cluster
   - Create service with task definition
   - Configure load balancer

### AWS Elastic Beanstalk

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Initialize EB**:
```bash
eb init
eb create my-todo-env
```

3. **Deploy**:
```bash
eb deploy
```

## Production Configuration

### Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use AWS Secrets Manager or Parameter Store
   - Rotate secrets regularly

2. **HTTPS**:
   - Use SSL/TLS certificates
   - Configure reverse proxy (Nginx)
   - Enable HSTS headers

3. **Database**:
   - Use managed database service (MongoDB Atlas, AWS DocumentDB)
   - Enable encryption at rest
   - Configure VPC security groups

4. **Monitoring**:
   - Set up CloudWatch or similar
   - Enable AWS X-Ray for tracing
   - Configure alerts and notifications

### Performance Optimization

1. **Frontend**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching headers
   - Optimize images

2. **Backend**:
   - Enable connection pooling
   - Use database indexes
   - Implement caching (Redis)
   - Optimize database queries

3. **Scaling**:
   - Horizontal scaling with load balancer
   - Auto-scaling based on metrics
   - Database read replicas

## Health Checks

### Application Health

The application includes health check endpoints:

- `GET /health` - Basic health check
- `GET /health/xray` - X-Ray status

Configure your load balancer to use these endpoints.

### Monitoring

Monitor the following metrics:

- Response time
- Error rate
- Request rate
- Database connections
- Memory usage
- CPU usage

## Backup and Recovery

### Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/my_todo_app" --out=/backup

# Restore
mongorestore --uri="mongodb://localhost:27017/my_todo_app" /backup
```

### Automated Backups

Set up automated backups:

- Daily database backups
- Store backups in S3
- Test restore procedures
- Document recovery process

## Troubleshooting

### Common Issues

1. **Database Connection**:
   - Check connection string
   - Verify network access
   - Check security groups

2. **Port Conflicts**:
   - Change ports in configuration
   - Check running processes

3. **Memory Issues**:
   - Increase container memory
   - Optimize application code
   - Monitor memory usage

### Logs

Access logs:

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# ECS logs
aws logs tail /ecs/my-todo-app --follow
```

## Rollback Procedure

If deployment fails:

1. Identify the issue
2. Revert to previous version
3. Restore database backup if needed
4. Verify application functionality
5. Document the issue

## CI/CD Pipeline

Set up continuous deployment:

1. **GitHub Actions** or **AWS CodePipeline**
2. **Build** Docker images
3. **Test** application
4. **Deploy** to staging
5. **Run** integration tests
6. **Deploy** to production

Example GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to AWS
        run: |
          # Deployment commands
```

