pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "vinothinisenniappan/vino-app"
        TAG = "latest"
    }

    stages {

        // Stage 1: Clone Code from GitHub
        stage('Clone Code') {
            steps {
                echo 'Cloning source code from GitHub...'
                checkout scm
            }
        }

        // Stage 2: Login to Docker Hub
        stage('Login to Docker Hub') {
            steps {
                echo 'Logging into Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-password',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat "echo %PASS% | docker login -u %USER% --password-stdin"
                }
            }
        }

        // Stage 3: Build Docker Image
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                bat "docker build --no-cache -t %DOCKER_IMAGE%:%TAG% ."
            }
        }

        // Stage 4: Push Docker Image
        stage('Push Docker Image') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                bat "docker push %DOCKER_IMAGE%:%TAG%"
            }
        }

        // Stage 5: Apply Kubernetes Namespace
        stage('Apply Kubernetes Namespace') {
            steps {
                echo 'Creating Kubernetes namespace...'
                bat "kubectl apply -f k8s/namespace.yaml"
                bat "kubectl get namespace vino-devops"
            }
        }

        // Stage 6: Deploy to Kubernetes
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying application to Kubernetes...'
                bat "kubectl apply -f k8s/deployment.yaml"
                bat "kubectl apply -f k8s/service.yaml"
                bat "kubectl rollout restart deployment my-app -n vino-devops"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Application deployed.'
        }
        failure {
            echo 'Pipeline failed. Check the logs for errors.'
        }
    }
}
