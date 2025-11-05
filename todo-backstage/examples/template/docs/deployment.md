# Deployment

This guide covers deploying the Full-Stack Todo Application to production environments.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or managed database service)
- Domain name and SSL certificate (for HTTPS)
- Environment variables configured

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-production-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# CORS
CORS_ORIGIN=https://your-domain.com
```

### Security Considerations

- Use strong, randomly generated JWT secrets
- Never commit `.env` files to version control
- Use environment-specific configurations
- Enable HTTPS in production
- Use managed database services for production

## Docker Deployment

### Build Docker Images

```bash
# Build frontend
docker build -f Dockerfile.frontend -t todo-frontend:latest .

# Build backend
docker build -f Dockerfile.backend -t todo-backend:latest .
```

### Docker Compose

Use the provided `docker-compose.yml` for production:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: todo_db
      POSTGRES_USER: todo_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      DATABASE_URL: postgresql://todo_user:${DB_PASSWORD}@postgres:5432/todo_db
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      VITE_API_URL: http://backend:5000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Start Services

```bash
docker-compose up -d
```

## Cloud Deployment

### AWS Deployment

#### Using Elastic Beanstalk

1. **Install EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**:
   ```bash
   eb init
   ```

3. **Create Environment**:
   ```bash
   eb create todo-production
   ```

4. **Set Environment Variables**:
   ```bash
   eb setenv DATABASE_URL=... JWT_SECRET=...
   ```

5. **Deploy**:
   ```bash
   eb deploy
   ```

#### Using ECS

1. **Build and Push Images**:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   docker build -t todo-app .
   docker tag todo-app:latest <account-id>.dkr.ecr.<region>.amazonaws.com/todo-app:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/todo-app:latest
   ```

2. **Create ECS Task Definition**
3. **Create ECS Service**
4. **Configure Load Balancer**

### Heroku Deployment

#### Backend

```bash
# Login to Heroku
heroku login

# Create app
heroku create my-todo-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Frontend

For frontend, use a static hosting service or build and serve from the backend.

### Vercel Deployment

#### Frontend

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

#### Backend

Vercel also supports serverless functions. Create an `api` directory and configure accordingly.

## Database Migration

### Run Migrations in Production

```bash
# Using Docker
docker-compose exec backend npm run migrate

# Direct connection
npm run migrate
```

### Backup Strategy

Set up regular database backups:

```bash
# PostgreSQL backup
pg_dump -h host -U user database > backup.sql

# Restore
psql -h host -U user database < backup.sql
```

## Monitoring and Logging

### Application Monitoring

- **Error Tracking**: Integrate Sentry or similar
- **Performance Monitoring**: Use New Relic or Datadog
- **Logging**: Centralized logging with ELK stack or CloudWatch

### Health Checks

The application includes health check endpoints:

```http
GET /health
```

### Log Management

Configure structured logging:

```javascript
// Use Winston or similar
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## SSL/HTTPS Configuration

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com
```

## CI/CD Pipeline

### GitHub Actions Example

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
      - name: Deploy to production
        run: |
          # Build and deploy steps
          docker-compose -f docker-compose.prod.yml up -d --build
```

## Scaling

### Horizontal Scaling

- **Load Balancer**: Distribute traffic across multiple backend instances
- **Database Connection Pooling**: Optimize database connections
- **CDN**: Use CDN for static frontend assets
- **Caching**: Implement Redis for session and data caching

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use database read replicas

## Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] Error tracking set up
- [ ] Performance testing completed
- [ ] Security audit performed
- [ ] Documentation updated

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify DATABASE_URL and network access
2. **CORS Errors**: Check CORS_ORIGIN configuration
3. **JWT Errors**: Verify JWT_SECRET matches across instances
4. **Build Failures**: Check Node.js version and dependencies

### Debugging Production

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check database
docker-compose exec postgres psql -U todo_user -d todo_db

# Test API
curl https://your-domain.com/api/health
```

