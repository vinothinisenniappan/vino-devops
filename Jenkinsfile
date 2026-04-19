pipeline {
    agent any

    // ──────────────────────────────────────────────
    // Environment Variables
    // ──────────────────────────────────────────────
    environment {
        DOCKER_REGISTRY  = 'docker.io'
        DOCKER_REPO      = 'vinodevops'                          // ← Replace with your Docker Hub username
        IMAGE_NAME       = 'vino-devops-app'
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
        FULL_IMAGE       = "${DOCKER_REGISTRY}/${DOCKER_REPO}/${IMAGE_NAME}"
        K8S_NAMESPACE    = 'vino-devops'
        DOCKER_CREDS_ID  = 'dockerhub-credentials'              // Jenkins credentials ID
        KUBECONFIG_ID    = 'kubeconfig-credentials'              // Jenkins credentials ID
    }

    // ──────────────────────────────────────────────
    // Triggers
    // ──────────────────────────────────────────────
    triggers {
        githubPush()    // Auto-trigger on GitHub webhook push
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ──────────────────────────────────
        // Stage 1: Clone Repository
        // ──────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Cloning repository...'
                checkout scm
            }
        }

        // ──────────────────────────────────
        // Stage 2: Build Docker Image
        // ──────────────────────────────────
        stage('Build Docker Image') {
            steps {
                echo "🔨 Building Docker image: ${FULL_IMAGE}:${IMAGE_TAG}"
                script {
                    dockerImage = docker.build("${FULL_IMAGE}:${IMAGE_TAG}", ".")
                }
            }
        }

        // ──────────────────────────────────
        // Stage 3: Login to Docker Registry
        // ──────────────────────────────────
        stage('Login to Docker Registry') {
            steps {
                echo '🔐 Logging into Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login ${DOCKER_REGISTRY} -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        // ──────────────────────────────────
        // Stage 4: Push Docker Image
        // ──────────────────────────────────
        stage('Push Docker Image') {
            steps {
                echo "📤 Pushing image: ${FULL_IMAGE}:${IMAGE_TAG} and ${FULL_IMAGE}:latest"
                script {
                    // Push versioned tag
                    docker.image("${FULL_IMAGE}:${IMAGE_TAG}").push()

                    // Tag and push 'latest'
                    docker.image("${FULL_IMAGE}:${IMAGE_TAG}").push('latest')
                }
            }
        }

        // ──────────────────────────────────
        // Stage 5: Deploy to Kubernetes
        // ──────────────────────────────────
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️  Deploying to Kubernetes cluster...'
                withCredentials([file(credentialsId: "${KUBECONFIG_ID}", variable: 'KUBECONFIG')]) {
                    // Create namespace if it doesn't exist
                    sh "kubectl apply -f k8s/namespace.yaml"

                    // Update deployment image tag
                    sh """
                        sed -i 's|image:.*|image: ${FULL_IMAGE}:${IMAGE_TAG}|g' k8s/deployment.yaml
                    """

                    // Apply Kubernetes manifests
                    sh "kubectl apply -f k8s/deployment.yaml -n ${K8S_NAMESPACE}"
                    sh "kubectl apply -f k8s/service.yaml -n ${K8S_NAMESPACE}"
                }
            }
        }

        // ──────────────────────────────────
        // Stage 6: Verify Deployment
        // ──────────────────────────────────
        stage('Verify Deployment') {
            steps {
                echo '✅ Verifying deployment rollout...'
                withCredentials([file(credentialsId: "${KUBECONFIG_ID}", variable: 'KUBECONFIG')]) {
                    sh "kubectl rollout status deployment/vino-devops-app -n ${K8S_NAMESPACE} --timeout=120s"
                    sh "kubectl get pods -n ${K8S_NAMESPACE} -l app=vino-devops-app"
                    sh "kubectl get svc -n ${K8S_NAMESPACE} -l app=vino-devops-app"
                }
            }
        }
    }

    // ──────────────────────────────────────────────
    // Post Actions
    // ──────────────────────────────────────────────
    post {
        success {
            echo '🎉 Pipeline completed successfully! Application deployed.'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above for errors.'
        }
        always {
            echo '🧹 Cleaning up workspace...'
            sh 'docker logout ${DOCKER_REGISTRY} || true'
            cleanWs()
        }
    }
}
