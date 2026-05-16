pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'bookflow'
        DOCKER_BUILDKIT      = '1'
        PYTHONDONTWRITEBYTECODE = '1'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ─────────────────────────────────────────
        // STAGE 1 — Código fuente
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────
        // STAGE 2 — Tests unitarios (paralelo)
        // ─────────────────────────────────────────
        stage('Unit Tests') {
            parallel {

                stage('auth-service') {
                    steps {
                        dir('auth-service') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-auth.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'auth-service/results-auth.xml'
                        }
                    }
                }

                stage('inventory-service') {
                    steps {
                        dir('inventory-service') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-inventory.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'inventory-service/results-inventory.xml'
                        }
                    }
                }

                stage('pricing-service') {
                    steps {
                        dir('pricing-service') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-pricing.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'pricing-service/results-pricing.xml'
                        }
                    }
                }

                stage('order-service') {
                    steps {
                        dir('order-service') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-order.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'order-service/results-order.xml'
                        }
                    }
                }

                stage('ai-enrichment-service') {
                    steps {
                        dir('ai-enrichment-service') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-enrichment.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'ai-enrichment-service/results-enrichment.xml'
                        }
                    }
                }

                stage('ai-assistant-service') {
                    steps {
                        dir('ai-assistant-service') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-assistant.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'ai-assistant-service/results-assistant.xml'
                        }
                    }
                }

                stage('bff-gateway') {
                    steps {
                        dir('bff-gateway') {
                            sh 'pip install -q --break-system-packages -r requirements.txt'
                            sh 'python3 -m pytest tests/ -v --tb=short --junitxml=results-bff.xml'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'bff-gateway/results-bff.xml'
                        }
                    }
                }

            }
        }

        // ─────────────────────────────────────────
        // STAGE 3 — Build imágenes Docker
        // ─────────────────────────────────────────
        stage('Build Docker Images') {
            steps {
                sh 'docker compose build --no-cache --parallel'
            }
        }

        // ─────────────────────────────────────────
        // STAGE 4 — Levanta stack + smoke test E2E
        // ─────────────────────────────────────────
        stage('Integration / E2E') {
            steps {
                sh 'docker compose up -d'
                sh 'sleep 20'
                sh '''
                    pip install -q --break-system-packages httpx
                    python3 e2e_flow_test.py
                '''
            }
        }

    }

    // ─────────────────────────────────────────
    // POST — Limpieza siempre, notificación si falla
    // ─────────────────────────────────────────
    post {
        always {
            sh 'docker compose down -v || true'
        }
        failure {
            echo "Pipeline falló — revisar logs arriba."
        }
        success {
            echo "Pipeline verde — BookFlow listo para demo."
        }
    }
}
