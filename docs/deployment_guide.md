# Deployment Guide for ThoughtWeb Navigator

This guide provides comprehensive instructions for deploying the ThoughtWeb Navigator application to production environments. It covers infrastructure setup, CI/CD pipeline configuration, database migration, monitoring, and maintenance procedures.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Deployment Process](#deployment-process)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Scaling Strategies](#scaling-strategies)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the deployment process, ensure you have:

- Access to your chosen cloud provider (AWS, GCP, Azure)
- Domain name and DNS access
- SSL certificates for secure connections
- Docker and Docker Compose installed
- Access to container registry (Docker Hub, AWS ECR, etc.)
- CI/CD platform access (GitHub Actions, GitLab CI, etc.)
- Monitoring tools (Prometheus, Grafana, etc.)

## Infrastructure Setup

### Cloud Provider Setup

#### AWS Setup

1. **Create a VPC with public and private subnets**

```bash
# Using AWS CLI
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=thoughtweb-vpc}]'
```

2. **Set up security groups**

```bash
# Create security group for web traffic
aws ec2 create-security-group --group-name thoughtweb-web-sg --description "Web traffic security group" --vpc-id vpc-id

# Allow HTTP and HTTPS traffic
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol tcp --port 443 --cidr 0.0.0.0/0
```

3. **Create an ECS cluster**

```bash
aws ecs create-cluster --cluster-name thoughtweb-cluster
```

#### GCP Setup

1. **Create a VPC network**

```bash
gcloud compute networks create thoughtweb-network --subnet-mode=auto
```

2. **Create firewall rules**

```bash
gcloud compute firewall-rules create thoughtweb-allow-http --network thoughtweb-network --allow tcp:80
gcloud compute firewall-rules create thoughtweb-allow-https --network thoughtweb-network --allow tcp:443
```

3. **Set up GKE cluster**

```bash
gcloud container clusters create thoughtweb-cluster \
    --zone us-central1-a \
    --num-nodes 3 \
    --machine-type e2-standard-2
```

### Container Registry Setup

#### Docker Hub

1. Create a Docker Hub account if you don't have one
2. Create a repository for your application
3. Generate access tokens for CI/CD

#### AWS ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name thoughtweb-navigator

# Authenticate Docker to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account-id.dkr.ecr.region.amazonaws.com
```

### Load Balancer Setup

#### AWS ALB

```bash
# Create target group
aws elbv2 create-target-group \
    --name thoughtweb-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-id \
    --target-type ip

# Create load balancer
aws elbv2 create-load-balancer \
    --name thoughtweb-alb \
    --subnets subnet-id-1 subnet-id-2 \
    --security-groups sg-id
```

#### GCP Load Balancer

```bash
gcloud compute addresses create thoughtweb-ip --global

gcloud compute health-checks create http thoughtweb-health-check \
    --port 80 \
    --request-path /health

gcloud compute backend-services create thoughtweb-backend \
    --protocol HTTP \
    --health-checks thoughtweb-health-check \
    --global
```

## Environment Configuration

### Environment Variables

Create environment variable files for different environments:

**.env.production**

```
# API Configuration
API_URL=https://api.thoughtweb.app
API_TIMEOUT=30000

# Authentication
AUTH_SECRET=your-auth-secret
AUTH_EXPIRY=86400

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=thoughtweb
DB_USER=db-user
DB_PASSWORD=db-password

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# LLM Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Storage
S3_BUCKET=thoughtweb-storage
S3_REGION=us-west-2
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Secrets Management

#### AWS Secrets Manager

```bash
# Store database credentials
aws secretsmanager create-secret \
    --name thoughtweb/db-credentials \
    --description "Database credentials for ThoughtWeb" \
    --secret-string '{"username":"db-user","password":"db-password"}'

# Store API keys
aws secretsmanager create-secret \
    --name thoughtweb/api-keys \
    --description "API keys for ThoughtWeb" \
    --secret-string '{"openai":"your-openai-key","anthropic":"your-anthropic-key"}'
```

#### GCP Secret Manager

```bash
# Create secrets
echo -n "db-password" | gcloud secrets create thoughtweb-db-password --data-file=-
echo -n "your-openai-key" | gcloud secrets create thoughtweb-openai-key --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding thoughtweb-db-password \
    --member="serviceAccount:your-service-account@your-project.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Database Setup

### Supabase Setup

1. Create a new Supabase project
2. Set up database tables as defined in the schema
3. Configure RLS policies for security
4. Set up authentication providers

### Database Migration

1. Create a migration script using Supabase migrations:

```bash
# Initialize migrations
npx supabase migration new initial_schema

# Apply migrations
npx supabase db push
```

2. Create the following tables:

```sql
-- Create users table extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  content_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create queries table
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  query TEXT NOT NULL,
  response TEXT,
  model TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_records table
CREATE TABLE usage_records (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  resource_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own sources"
  ON sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources"
  ON sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON sources FOR DELETE
  USING (auth.uid() = user_id);
```

### Vector Database Setup

For Pinecone:

1. Create a Pinecone account
2. Create an index for document embeddings:

```bash
# Using Pinecone Python client
import pinecone

pinecone.init(api_key="your-api-key", environment="your-environment")
pinecone.create_index("thoughtweb-documents", dimension=1536, metric="cosine")
```

## CI/CD Pipeline

### GitHub Actions Setup

Create a GitHub Actions workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy ThoughtWeb Navigator

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: yourusername/thoughtweb-frontend:latest,yourusername/thoughtweb-frontend:${{ github.sha }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: yourusername/thoughtweb-backend:latest,yourusername/thoughtweb-backend:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up kubectl
        uses: azure/setup-kubectl@v3
        
      - name: Set Kubernetes context
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
          
      - name: Deploy to Kubernetes
        run: |
          # Update image tags in deployment files
          sed -i 's|image: yourusername/thoughtweb-frontend:.*|image: yourusername/thoughtweb-frontend:${{ github.sha }}|' kubernetes/frontend-deployment.yaml
          sed -i 's|image: yourusername/thoughtweb-backend:.*|image: yourusername/thoughtweb-backend:${{ github.sha }}|' kubernetes/backend-deployment.yaml
          
          # Apply Kubernetes manifests
          kubectl apply -f kubernetes/
          
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/thoughtweb-frontend
          kubectl rollout status deployment/thoughtweb-backend
```

### GitLab CI Setup

Create a GitLab CI configuration file at `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  cache:
    paths:
      - node_modules/

build-frontend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA -t $CI_REGISTRY_IMAGE/frontend:latest ./frontend
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:latest

build-backend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA -t $CI_REGISTRY_IMAGE/backend:latest ./backend
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/backend:latest

deploy:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT
    - sed -i "s|image: $CI_REGISTRY_IMAGE/frontend:.*|image: $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA|" kubernetes/frontend-deployment.yaml
    - sed -i "s|image: $CI_REGISTRY_IMAGE/backend:.*|image: $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA|" kubernetes/backend-deployment.yaml
    - kubectl apply -f kubernetes/
    - kubectl rollout status deployment/thoughtweb-frontend
    - kubectl rollout status deployment/thoughtweb-backend
  environment:
    name: production
    url: https://thoughtweb.app
```

## Deployment Process

### Kubernetes Deployment

Create Kubernetes manifests for your application:

**kubernetes/namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: thoughtweb
```

**kubernetes/frontend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: thoughtweb-frontend
  namespace: thoughtweb
spec:
  replicas: 3
  selector:
    matchLabels:
      app: thoughtweb-frontend
  template:
    metadata:
      labels:
        app: thoughtweb-frontend
    spec:
      containers:
      - name: frontend
        image: yourusername/thoughtweb-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        env:
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: thoughtweb-config
              key: api_url
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

**kubernetes/backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: thoughtweb-backend
  namespace: thoughtweb
spec:
  replicas: 3
  selector:
    matchLabels:
      app: thoughtweb-backend
  template:
    metadata:
      labels:
        app: thoughtweb-backend
    spec:
      containers:
      - name: backend
        image: yourusername/thoughtweb-backend:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: thoughtweb-db-credentials
              key: host
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: thoughtweb-db-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: thoughtweb-db-credentials
              key: password
        - name: DB_NAME
          valueFrom:
            configMapKeyRef:
              name: thoughtweb-config
              key: db_name
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: thoughtweb-api-keys
              key: openai
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**kubernetes/services.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: thoughtweb-frontend
  namespace: thoughtweb
spec:
  selector:
    app: thoughtweb-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: thoughtweb-backend
  namespace: thoughtweb
spec:
  selector:
    app: thoughtweb-backend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

**kubernetes/ingress.yaml**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: thoughtweb-ingress
  namespace: thoughtweb
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - thoughtweb.app
    - api.thoughtweb.app
    secretName: thoughtweb-tls
  rules:
  - host: thoughtweb.app
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: thoughtweb-frontend
            port:
              number: 80
  - host: api.thoughtweb.app
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: thoughtweb-backend
            port:
              number: 80
```

**kubernetes/config.yaml**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: thoughtweb-config
  namespace: thoughtweb
data:
  api_url: "https://api.thoughtweb.app"
  db_name: "thoughtweb"
```

### Docker Compose Deployment

For simpler deployments, you can use Docker Compose:

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    image: yourusername/thoughtweb-frontend:latest
    restart: always
    ports:
      - "80:80"
      - "443:443"
    environment:
      - API_URL=https://api.thoughtweb.app
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend

  backend:
    image: yourusername/thoughtweb-backend:latest
    restart: always
    environment:
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    volumes:
      - ./uploads:/app/uploads
```

### Blue-Green Deployment

For zero-downtime deployments, implement a blue-green deployment strategy:

1. Create two identical environments (blue and green)
2. Deploy new version to the inactive environment
3. Test the new deployment
4. Switch traffic from active to inactive environment
5. Keep the old environment running for quick rollback if needed

**kubernetes/blue-green-service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: thoughtweb-frontend
  namespace: thoughtweb
spec:
  selector:
    app: thoughtweb-frontend
    deployment: blue  # Switch between blue and green
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

## Monitoring and Logging

### Prometheus and Grafana Setup

1. Install Prometheus and Grafana using Helm:

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/prometheus \
    --namespace monitoring \
    --create-namespace

# Install Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
    --namespace monitoring \
    --set adminPassword=your-secure-password
```

2. Create a Prometheus scrape configuration:

**prometheus-config.yaml**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
```

3. Create Grafana dashboards for monitoring:
   - System metrics dashboard
   - Application metrics dashboard
   - Business metrics dashboard

### ELK Stack for Logging

1. Install Elasticsearch, Logstash, and Kibana:

```bash
# Add Elastic Helm repository
helm repo add elastic https://helm.elastic.co
helm repo update

# Install Elasticsearch
helm install elasticsearch elastic/elasticsearch \
    --namespace logging \
    --create-namespace

# Install Kibana
helm install kibana elastic/kibana \
    --namespace logging \
    --set service.type=LoadBalancer

# Install Filebeat
helm install filebeat elastic/filebeat \
    --namespace logging
```

2. Configure Filebeat to collect logs:

**filebeat-config.yaml**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
  namespace: logging
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
      processors:
        - add_kubernetes_metadata:
            host: ${NODE_NAME}
            matchers:
            - logs_path:
                logs_path: "/var/log/containers/"

    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
```

### Application Monitoring with Sentry

1. Create a Sentry account and project
2. Add Sentry to your application:

**Frontend Integration**
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Backend Integration**
```python
# app/core/sentry.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

def init_sentry():
    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN"),
        environment=os.environ.get("ENVIRONMENT", "production"),
        traces_sample_rate=1.0,
        integrations=[FastApiIntegration()]
    )
```

## Backup and Recovery

### Database Backup

1. Set up automated Supabase backups:

```bash
# Using Supabase CLI
npx supabase db dump -f backup.sql
```

2. Create a backup script and schedule it with cron:

**backup.sh**
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
BACKUP_FILE="$BACKUP_DIR/thoughtweb_backup_$TIMESTAMP.sql"

# Create backup
npx supabase db dump -f $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://thoughtweb-backups/

# Keep only last 7 days of backups locally
find $BACKUP_DIR -name "thoughtweb_backup_*.sql.gz" -type f -mtime +7 -delete
```

3. Schedule the backup script:

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/thoughtweb-backup.log 2>&1
```

### Disaster Recovery Plan

1. Document recovery procedures:
   - Database restoration
   - Application redeployment
   - DNS failover

2. Create a recovery script:

**restore.sh**
```bash
#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: restore.sh <backup_file>"
  exit 1
fi

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  LOCAL_FILE="/tmp/$(basename $BACKUP_FILE)"
  aws s3 cp $BACKUP_FILE $LOCAL_FILE
  BACKUP_FILE=$LOCAL_FILE
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c $BACKUP_FILE > ${BACKUP_FILE%.gz}
  BACKUP_FILE=${BACKUP_FILE%.gz}
fi

# Restore database
npx supabase db restore -f $BACKUP_FILE

echo "Database restored successfully from $BACKUP_FILE"
```

## Security Considerations

### SSL/TLS Configuration

1. Obtain SSL certificates from Let's Encrypt:

```bash
# Using cert-manager in Kubernetes
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

2. Configure NGINX for SSL:

**nginx.conf**
```nginx
server {
    listen 80;
    server_name thoughtweb.app www.thoughtweb.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name thoughtweb.app www.thoughtweb.app;

    ssl_certificate /etc/nginx/ssl/thoughtweb.crt;
    ssl_certificate_key /etc/nginx/ssl/thoughtweb.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Network Security

1. Set up network policies in Kubernetes:

**kubernetes/network-policy.yaml**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: thoughtweb-network-policy
  namespace: thoughtweb
spec:
  podSelector:
    matchLabels:
      app: thoughtweb-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: thoughtweb-frontend
    ports:
    - protocol: TCP
      port: 8000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: default
      podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### Security Headers

Configure security headers in your frontend application:

**nginx.conf (additional headers)**
```nginx
# Add to your server block
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.thoughtweb.app https://*.supabase.co";
add_header Referrer-Policy no-referrer-when-downgrade;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Authentication Security

1. Configure Supabase authentication with secure settings:
   - Set minimum password length
   - Require email verification
   - Set up MFA (Multi-Factor Authentication)

2. Implement proper token handling:
   - Store tokens securely (HTTP-only cookies)
   - Implement token refresh mechanism
   - Set appropriate token expiration times

## Performance Optimization

### Frontend Optimization

1. **Code Splitting and Lazy Loading**

```typescript
// src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loading from './components/ui/Loading';

// Lazy load pages
const Home = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Sources = lazy(() => import('./pages/Sources'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

2. **Asset Optimization**

```bash
# Install compression plugins
npm install compression-webpack-plugin --save-dev
npm install image-webpack-loader --save-dev
```

3. **Implement Caching Strategy**

```nginx
# Add to your nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, no-transform";
}
```

### Backend Optimization

1. **Database Query Optimization**

```sql
-- Add indexes to frequently queried columns
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_queries_user_id ON queries(user_id);
```

2. **Implement Caching**

```typescript
// src/lib/cache.ts
import NodeCache from 'node-cache';

// Create a cache with 10-minute TTL
const cache = new NodeCache({ stdTTL: 600 });

export function getCachedData<T>(key: string, fetchData: () => Promise<T>): Promise<T> {
  const cachedData = cache.get<T>(key);
  if (cachedData) {
    return Promise.resolve(cachedData);
  }

  return fetchData().then(data => {
    cache.set(key, data);
    return data;
  });
}
```

3. **API Rate Limiting**

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { getUserSubscriptionTier } from '../lib/subscription';

export const createRateLimiter = (endpoint: string) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
      // Apply default rate limit for unauthenticated users
      return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 30, // 30 requests per window
        message: 'Too many requests, please try again later.',
      })(req, res, next);
    }

    // Get user's subscription tier
    const tier = await getUserSubscriptionTier(userId);
    
    // Apply different rate limits based on subscription tier
    let limit = 30; // Default
    if (tier === 'professional') {
      limit = 300;
    } else if (tier === 'personal') {
      limit = 100;
    }

    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: limit,
      message: 'Rate limit exceeded. Consider upgrading your subscription for higher limits.',
    })(req, res, next);
  };
};
```

## Scaling Strategies

### Horizontal Scaling

1. **Configure Kubernetes HPA (Horizontal Pod Autoscaler)**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: thoughtweb-backend-hpa
  namespace: thoughtweb
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: thoughtweb-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

2. **Implement Database Connection Pooling**

```typescript
// src/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

export default pool;
```

### Vertical Scaling

1. **Resource Allocation**

Adjust resource requests and limits in Kubernetes deployments:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

2. **Database Instance Sizing**

For managed database services like AWS RDS or GCP Cloud SQL, choose appropriate instance types based on workload:

- Development/Testing: Small instances (e.g., db.t3.small)
- Production: Memory-optimized instances (e.g., db.r5.large)

### Global Distribution

1. **Content Delivery Network (CDN)**

Set up a CDN for static assets:

```bash
# Using AWS CloudFront
aws cloudfront create-distribution \
    --origin-domain-name thoughtweb-assets.s3.amazonaws.com \
    --default-root-object index.html
```

2. **Multi-Region Deployment**

Deploy the application to multiple regions for global availability:

```bash
# Deploy to US region
kubectl config use-context us-cluster
kubectl apply -f kubernetes/

# Deploy to EU region
kubectl config use-context eu-cluster
kubectl apply -f kubernetes/

# Deploy to Asia region
kubectl config use-context asia-cluster
kubectl apply -f kubernetes/
```

3. **Configure Global DNS with GeoDNS**

```bash
# Using AWS Route 53
aws route53 create-health-check \
    --caller-reference $(date +%s) \
    --health-check-config "{ \"Type\": \"HTTPS\", \"FullyQualifiedDomainName\": \"us.thoughtweb.app\", \"Port\": 443, \"ResourcePath\": \"/health\" }"

aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch '{
      "Changes": [
        {
          "Action": "CREATE",
          "ResourceRecordSet": {
            "Name": "thoughtweb.app",
            "Type": "CNAME",
            "SetIdentifier": "us-east",
            "Region": "us-east-1",
            "TTL": 60,
            "ResourceRecords": [
              {
                "Value": "us.thoughtweb.app"
              }
            ]
          }
        },
        {
          "Action": "CREATE",
          "ResourceRecordSet": {
            "Name": "thoughtweb.app",
            "Type": "CNAME",
            "SetIdentifier": "eu-west",
            "Region": "eu-west-1",
            "TTL": 60,
            "ResourceRecords": [
              {
                "Value": "eu.thoughtweb.app"
              }
            ]
          }
        }
      ]
    }'
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Symptoms:**
- Backend logs show connection errors
- API endpoints return 500 errors

**Solutions:**
- Check database credentials in environment variables
- Verify network connectivity to database
- Check database instance status
- Inspect database logs for errors

```bash
# Check database connectivity
kubectl exec -it $(kubectl get pods -l app=thoughtweb-backend -o jsonpath='{.items[0].metadata.name}') -- nc -zv $DB_HOST $DB_PORT

# View database logs
kubectl logs $(kubectl get pods -l app=postgres -o jsonpath='{.items[0].metadata.name}')
```

#### 2. Pod Startup Failures

**Symptoms:**
- Pods stuck in "Pending" or "CrashLoopBackOff" state
- Application not accessible

**Solutions:**
- Check pod events and logs
- Verify resource constraints
- Check image pull errors

```bash
# Get pod events
kubectl describe pod $(kubectl get pods -l app=thoughtweb-backend -o jsonpath='{.items[0].metadata.name}')

# Check pod logs
kubectl logs $(kubectl get pods -l app=thoughtweb-backend -o jsonpath='{.items[0].metadata.name}')

# Check if there are resource constraints
kubectl describe nodes | grep -A 5 "Allocated resources"
```

#### 3. SSL/TLS Certificate Issues

**Symptoms:**
- Browser shows certificate warnings
- HTTPS connections fail

**Solutions:**
- Check certificate expiration
- Verify certificate chain
- Ensure proper domain configuration

```bash
# Check certificate expiration
openssl x509 -in /path/to/certificate.crt -text -noout | grep "Not After"

# Verify certificate chain
openssl verify -CAfile /path/to/chain.pem /path/to/certificate.crt
```

### Debugging Tools

#### 1. Kubernetes Debugging

```bash
# Port forward to a service for direct access
kubectl port-forward svc/thoughtweb-backend 8000:80

# Get a shell in a running container
kubectl exec -it $(kubectl get pods -l app=thoughtweb-backend -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

# View container logs
kubectl logs -f $(kubectl get pods -l app=thoughtweb-backend -o jsonpath='{.items[0].metadata.name}')
```

#### 2. Application Debugging

```bash
# Enable debug logging
kubectl set env deployment/thoughtweb-backend LOG_LEVEL=debug

# Check application health
curl -v https://api.thoughtweb.app/health

# Test database connection
kubectl exec -it $(kubectl get pods -l app=thoughtweb-backend -o jsonpath='{.items[0].metadata.name}') -- node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0]);
  }
  pool.end();
});"
```

#### 3. Network Debugging

```bash
# Install network debugging tools
kubectl apply -f https://k8s.io/examples/admin/dns/dnsutils.yaml

# Test DNS resolution
kubectl exec -i -t dnsutils -- nslookup thoughtweb-backend.thoughtweb.svc.cluster.local

# Test network connectivity
kubectl exec -i -t dnsutils -- curl -v http://thoughtweb-backend.thoughtweb.svc.cluster.local:80/health
```

### Monitoring Alerts

Set up alerts for common issues:

1. **High Error Rate Alert**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: high-error-rate
  namespace: monitoring
spec:
  groups:
  - name: thoughtweb.rules
    rules:
    - alert: HighErrorRate
      expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "High HTTP error rate"
        description: "Error rate is above 5% (current value: {{ $value }})"
```

2. **Database Connection Alert**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: database-connection-issues
  namespace: monitoring
spec:
  groups:
  - name: thoughtweb.rules
    rules:
    - alert: DatabaseConnectionIssues
      expr: pg_stat_activity_count{datname="thoughtweb"} < 1
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "Database connection issues"
        description: "No active connections to the database for more than 1 minute"
```

3. **Memory Usage Alert**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: high-memory-usage
  namespace: monitoring
spec:
  groups:
  - name: thoughtweb.rules
    rules:
    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes{namespace="thoughtweb"} / container_spec_memory_limit_bytes{namespace="thoughtweb"} > 0.85
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage"
        description: "Container memory usage is above 85% for 5 minutes (current value: {{ $value }})"
```

## Conclusion

This deployment guide provides a comprehensive framework for deploying the ThoughtWeb Navigator application to production environments. By following these instructions, you can set up a robust, scalable, and secure infrastructure that supports the application's requirements.

Remember to adapt these guidelines to your specific environment and requirements. Regular testing, monitoring, and maintenance are essential to ensure the continued performance and reliability of your deployment.

For any issues or questions, refer to the troubleshooting section or contact the development team for assistance.
