pipeline {
    agent any

    triggers {
        // Local Jenkins can't receive GitHub webhooks, so poll for new commits.
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        // Username/password credential: Docker Hub username + access token.
        DOCKERHUB      = credentials('dockerhub-creds')
        IMAGE_NAME     = 'ricemania'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'ricemania'
        APP_PORT       = '3002'
        // Same volume the root compose.yaml creates, so uploaded images survive.
        UPLOADS_VOLUME = 'ricemania_devops-main_uploads'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build Image') {
            steps {
                sh '''
                    docker build \
                      -t "$DOCKERHUB_USR/$IMAGE_NAME:$IMAGE_TAG" \
                      -t "$DOCKERHUB_USR/$IMAGE_NAME:latest" .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin
                    docker push "$DOCKERHUB_USR/$IMAGE_NAME:$IMAGE_TAG"
                    docker push "$DOCKERHUB_USR/$IMAGE_NAME:latest"
                '''
            }
        }

        stage('Deploy') {
            steps {
                // Secret file credential holding the contents of .env.local.
                withCredentials([file(credentialsId: 'ricemania-env', variable: 'APP_ENV_FILE')]) {
                    sh '''
                        docker pull "$DOCKERHUB_USR/$IMAGE_NAME:$IMAGE_TAG"
                        docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
                        docker run -d \
                          --name "$CONTAINER_NAME" \
                          --env-file "$APP_ENV_FILE" \
                          -e HOSTNAME=0.0.0.0 \
                          -e PORT="$APP_PORT" \
                          -p "$APP_PORT:$APP_PORT" \
                          -v "$UPLOADS_VOLUME:/app/public/uploads" \
                          --dns 8.8.8.8 --dns 8.8.4.4 \
                          --restart unless-stopped \
                          "$DOCKERHUB_USR/$IMAGE_NAME:$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Smoke Test') {
            steps {
                // Jenkins runs in a container, so reach the app through the host.
                sh '''
                    for i in $(seq 1 15); do
                      if curl -fsS -o /dev/null "http://host.docker.internal:$APP_PORT"; then
                        echo "App is up"; exit 0
                      fi
                      sleep 4
                    done
                    echo "App did not respond"; docker logs --tail 50 "$CONTAINER_NAME"; exit 1
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            // Remove dangling layers left behind by rebuilds.
            sh 'docker image prune -f || true'
        }
        success {
            echo "Deployed $DOCKERHUB_USR/$IMAGE_NAME:$IMAGE_TAG at http://localhost:$APP_PORT"
        }
    }
}
