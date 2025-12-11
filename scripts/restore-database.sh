#!/bin/bash

###############################################################################
# DATABASE RESTORE SCRIPT FOR SOUTHERN APPARELS ERP
###############################################################################
# This script restores PostgreSQL database from backup
# CAUTION: This will overwrite existing database!
###############################################################################

# Exit on error
set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0;NC' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/postgres}"

DB_CONTAINER="${DB_CONTAINER:-rmg_erp_postgres_prod}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-rmg_erp}"

###############################################################################
# Functions
###############################################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Example:"
    echo "  $0 rmg_erp_backup_20251208_143000.sql.gz"
    echo ""
    echo "Available backups:"
    find "${BACKUP_DIR}" -name "*.sql.gz" -type f -printf "  %f\n" 2>/dev/null | sort -r | head -10
}

restore_database() {
    BACKUP_FILE="$1"
    FULL_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

    # Check if file exists
    if [ ! -f "${FULL_PATH}" ]; then
        log_error "Backup file not found: ${FULL_PATH}"
        exit 1
    fi

    log_warn "⚠️  WARNING: This will OVERWRITE the existing database!"
    log_warn "Database: ${POSTGRES_DB}"
    log_warn "Container: ${DB_CONTAINER}"
    log_warn "Backup: ${BACKUP_FILE}"
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

    if [ "${CONFIRM}" != "yes" ]; then
        log_info "Restore cancelled."
        exit 0
    fi

    log_info "Starting database restore..."

    # Decompress and restore
    gunzip -c "${FULL_PATH}" | docker exec -i "${DB_CONTAINER}" psql \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}"

    log_info "✅ Database restored successfully!"
}

###############################################################################
# Main Script
###############################################################################

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

restore_database "$1"
