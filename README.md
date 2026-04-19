# Vino DevOps — CI/CD with Jenkins, Docker & Kubernetes

## Project Overview

This project demonstrates an end-to-end **CI/CD pipeline** that automates the build, containerization, and deployment of a Node.js application using **Jenkins**, **Docker**, and **Kubernetes**.

## Architecture

```
GitHub Repository
       │
       ▼
    Jenkins Pipeline
       │
       ├── 1. Clone Code from GitHub
       ├── 2. Build Docker Image
       ├── 3. Login to Docker Hub
       ├── 4. Push Docker Image
       ├── 5. Apply Kubernetes Namespace
       └── 6. Deploy to Kubernetes
              │
              ▼
       Kubernetes Cluster
       ├── 2 Pods (my-app)
       └── NodePort Service (port 30080)
```

## Folder Structure

```
vino-devops/
├── app/
│   ├── package.json
│   └── server.js
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── .dockerignore
├── Dockerfile
├── Jenkinsfile
└── README.md
```

## Prerequisites

- **Jenkins** (with Docker and Kubernetes plugins)
- **Docker** (installed on Jenkins agent)
- **Kubernetes** cluster (Minikube or any K8s cluster)
- **kubectl** (configured to access your cluster)
- **Docker Hub** account

## Steps to Run

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<your-username>/vino-devops.git
git push -u origin main
```

### 2. Configure Jenkins Pipeline

1. Open Jenkins → **New Item** → **Pipeline**
2. Under **Pipeline**, select **Pipeline script from SCM**
3. Set SCM to **Git** and enter your repository URL
4. Set **Script Path** to `Jenkinsfile`
5. Save

### 3. Add Docker Hub Credentials in Jenkins

1. Go to **Manage Jenkins** → **Credentials** → **Global**
2. Click **Add Credentials**
3. Select **Username with password**
4. Enter:
   - **Username**: your Docker Hub username
   - **Password**: your Docker Hub password or access token
   - **ID**: `dockerhub-password`
5. Click **OK**

### 4. Update Image Name

Update the `DOCKER_IMAGE` variable in the `Jenkinsfile`:

```groovy
DOCKER_IMAGE = "vinothinisenniappan/vino-app"
```

Also update the image in `k8s/deployment.yaml`:

```yaml
image: vinothinisenniappan/vino-app:latest
```

### 5. Run the Build

- Click **Build Now** in Jenkins
- Monitor the pipeline stages in the console output

## Expected Output

After a successful pipeline run:

| Result | Details |
|--------|---------|
| Docker image pushed | `vinothinisenniappan/vino-app:latest` on Docker Hub |
| Kubernetes pods running | 2 replicas of `my-app` in namespace `vino-devops` |
| App accessible | Via NodePort at `http://<node-ip>:30080` |

### Verify

```bash
# Check pods
kubectl get pods -n vino-devops

# Check service
kubectl get svc -n vino-devops

# Access the app
curl http://<node-ip>:30080
# Output: App is running

curl http://<node-ip>:30080/health
# Output: {"status":"OK"}
```
