# 🚀 Vino DevOps — CI/CD Pipeline with Jenkins, Docker & Kubernetes

A complete DevOps project demonstrating automated application deployment using **Jenkins**, **Docker**, and **Kubernetes**.

---

## 📁 Project Structure

```
vino-devops/
├── app/
│   ├── server.js          # Node.js Express application
│   └── package.json       # Node.js dependencies
├── k8s/
│   ├── namespace.yaml     # Kubernetes namespace
│   ├── deployment.yaml    # Deployment with 2 replicas + health checks
│   └── service.yaml       # NodePort service (port 30080)
├── Dockerfile             # Multi-stage Docker build
├── .dockerignore           # Docker build exclusions
├── Jenkinsfile            # CI/CD pipeline definition
└── README.md
```

---

## 🔄 Pipeline Architecture

```
┌──────────┐    ┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ GitHub   │───▶│ Jenkins  │───▶│ Docker Build  │───▶│ Docker Hub   │───▶│ Kubernetes  │───▶│ Verify   │
│ Push     │    │ Checkout │    │ & Tag         │    │ Push         │    │ Deploy      │    │ Rollout  │
└──────────┘    └──────────┘    └───────────────┘    └──────────────┘    └─────────────┘    └──────────┘
     │                                                                                           │
     │              GitHub Webhook triggers Jenkins automatically                                │
     └───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

| Tool        | Version  | Purpose                        |
|-------------|----------|--------------------------------|
| Jenkins     | 2.x+     | CI/CD automation               |
| Docker      | 20.x+    | Containerization               |
| kubectl     | 1.25+    | Kubernetes CLI                 |
| Node.js     | 18.x+    | Application runtime            |
| Git         | 2.x+     | Version control                |

---

## ⚙️ Setup Instructions

### 1. Jenkins Configuration

#### Required Plugins
- Docker Pipeline
- GitHub Integration
- Kubernetes CLI
- Credentials Binding

#### Credentials to Add (Manage Jenkins → Credentials)

| Credential ID            | Type              | Description                     |
|--------------------------|-------------------|---------------------------------|
| `dockerhub-credentials`  | Username/Password | Docker Hub login                |
| `kubeconfig-credentials`  | Secret File       | Kubernetes cluster kubeconfig   |

### 2. Docker Hub Setup

1. Create a Docker Hub account at [hub.docker.com](https://hub.docker.com)
2. Create a repository named `vino-devops-app`
3. Update `DOCKER_REPO` in the `Jenkinsfile` with your Docker Hub username

### 3. Kubernetes Cluster Setup

```bash
# Create the Docker Hub pull secret
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=docker.io \
  --docker-username=<your-username> \
  --docker-password=<your-password> \
  --docker-email=<your-email> \
  -n vino-devops
```

### 4. GitHub Webhook (Optional)

1. Go to your GitHub repo → **Settings** → **Webhooks**
2. Add webhook:
   - **URL**: `http://<jenkins-url>/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Just the push event

---

## 🏃 Running Locally

```bash
# Install dependencies
cd app
npm install

# Start the server
npm start

# Available endpoints
# http://localhost:3000         → Home
# http://localhost:3000/health  → Health check
# http://localhost:3000/api/info → API info
```

---

## 🐳 Docker Commands

```bash
# Build
docker build -t vino-devops-app:latest .

# Run
docker run -d -p 3000:3000 --name vino-app vino-devops-app:latest

# Test
curl http://localhost:3000/health
```

---

## ☸️ Kubernetes Commands

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml -n vino-devops
kubectl apply -f k8s/service.yaml -n vino-devops

# Check status
kubectl get pods -n vino-devops
kubectl get svc -n vino-devops

# Access the app (Minikube)
minikube service vino-devops-service -n vino-devops

# Access the app (NodePort)
# http://<node-ip>:30080
```

---

## 🛡️ Security Best Practices

- ✅ Non-root container user
- ✅ Multi-stage Docker build (minimal image size)
- ✅ Credentials stored securely in Jenkins
- ✅ Resource limits enforced in Kubernetes
- ✅ Health checks for automatic recovery
- ✅ Rolling update strategy (zero downtime)

---

## 📝 License

MIT License
