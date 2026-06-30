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

export image_name="registry.gitlab.com/meu-solutions/crm-frontend"
export environment_name="production"
export env_file="/home/gitlab-runner/crm-frontend/.env"

export health_check_retries="36"
export health_check_interval="5"

export PROJECT_NAME="crm-frontend"
export ENVIRONMENT_NAME="$environment_name"
export PORT_APP="8130"

export IMAGE_REF="${image_name}:0.1-prod"