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
# shellcheck disable=SC1091
. "$SCRIPT_DIR/env-param.sh"

echo "=== Preparing build-time .env ==="
cp "$env_file" .env

echo "=== Loading .env for build arguments ==="
set -a
# shellcheck disable=SC1091
. ./.env
set +a

BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "=== Logging in to GitLab Container Registry ==="
docker logout registry.gitlab.com
echo "$CI_PERMISSION" | docker login registry.gitlab.com \
    -u "$REGISTRY_USER" --password-stdin

echo "=== Building Docker image: ${IMAGE_REF} ==="
docker build \
    --pull \
    --label "org.opencontainers.image.revision=${CI_COMMIT_SHA:-}" \
    --label "org.opencontainers.image.created=${BUILD_TIME}" \
    --label "org.opencontainers.image.source=${CI_PROJECT_URL:-}" \
    -t "${IMAGE_REF}" \
    .

echo "=== Pushing image to registry ==="
docker push "${IMAGE_REF}"

echo "Docker image pushed successfully: ${IMAGE_REF}"