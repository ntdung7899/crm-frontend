#!/bin/bash

# ==========================================
# Author:         Duong Nhat Khoa
# Email:          nhatkhoa.working@gmail.com
# Phone:          +84 828 505 090
# -----------------------------------
# Created:        2026-06-30
# LastEditTime:   2026-06-30
# Version:        1.0
# Status:         New
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$SCRIPT_DIR/env-param.sh"

export APP_IMAGE="${IMAGE_REF}"

echo "=== Deploying ${IMAGE_REF} to ${environment_name} ==="

echo "--- Logging in to GitLab Container Registry ---"
docker logout registry.gitlab.com
echo "$CI_PERMISSION" | docker login registry.gitlab.com \
    -u "$REGISTRY_USER" --password-stdin

echo "--- Capturing current running image (for reference) ---"
PREVIOUS_IMAGE="$(
    docker compose ps -q app \
    | xargs -r docker inspect --format='{{.Config.Image}}' 2>/dev/null || true
)"
echo "Previous image: ${PREVIOUS_IMAGE:-<none running>}"

echo "--- Pulling new image ---"
docker compose pull app

echo "--- Starting new container ---"
docker compose up -d --remove-orphans app

remove_failed_container() {
    echo "--- Removing failed app container ---"
    docker compose rm --force --stop app || true
}

echo "--- Waiting for application to become healthy ---"
APP_CONTAINER_ID="$(docker compose ps -q app)"

if [ -z "$APP_CONTAINER_ID" ]; then
    echo "ERROR: Application container was not created."
    docker compose ps app || true
    remove_failed_container
    exit 1
fi

for attempt in $(seq 1 "$health_check_retries"); do
    CONTAINER_STATUS="$(docker inspect --format='{{.State.Status}}' "$APP_CONTAINER_ID")"
    HEALTH_STATUS="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$APP_CONTAINER_ID")"

    echo "Health check ${attempt}/${health_check_retries}: container=${CONTAINER_STATUS}, health=${HEALTH_STATUS}"

    if [ "$CONTAINER_STATUS" != "running" ]; then
        echo "ERROR: Application container stopped before becoming healthy."
        docker compose ps app || true
        docker compose logs --tail=200 app || true
        remove_failed_container
        exit 1
    fi

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo "Application is healthy."
        break
    fi

    if [ "$HEALTH_STATUS" = "unhealthy" ]; then
        echo "ERROR: Application container reported an unhealthy status."
        docker compose ps app || true
        docker inspect --format='{{range .State.Health.Log}}{{println .End .ExitCode .Output}}{{end}}' "$APP_CONTAINER_ID" || true
        docker compose logs --tail=200 app || true
        remove_failed_container
        exit 1
    fi

    if [ "$attempt" -eq "$health_check_retries" ]; then
        echo "ERROR: Application did not become healthy after $((health_check_retries * health_check_interval)) seconds."
        docker compose ps app || true
        docker inspect --format='{{range .State.Health.Log}}{{println .End .ExitCode .Output}}{{end}}' "$APP_CONTAINER_ID" || true
        docker compose logs --tail=200 app || true
        remove_failed_container
        exit 1
    fi

    sleep "$health_check_interval"
done

echo "--- Cleaning up dangling images ---"
docker image prune -f || true

echo "=== Deployment successful: ${IMAGE_REF} ==="
