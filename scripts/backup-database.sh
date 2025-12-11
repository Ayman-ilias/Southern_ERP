#!/bin/bash

###############################################################################
# DATABASE BACKUP SCRIPT FOR SOUTHERN APPARELS ERP
###############################################################################
# This script creates automated backups of the PostgreSQL database
# Features:
#   - Creates timestamped backup files
#   - Compresses backups to save space
#   - Automatically removes old backups
#   - Supports both local and remote backups
#   - Includes data integrity verification
###############################################################################

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Database configuration (from environment or defaults)
DB_CONTAINER="${DB_CONTAINER:-rmg_erp_postgres_prod}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-rmg_erp}"

# Timestamp for backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="rmg_erp_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

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

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    # Check if database container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
        log_error "Database container '${DB_CONTAINER}' not found."
        log_info "Available containers:"
        docker ps -a --format '{{.Names}}'
        exit 1
    fi

    # Check if database container is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
        log_error "Database container '${DB_CONTAINER}' is not running."
        log_info "Starting container..."
        docker start "${DB_CONTAINER}"
        sleep 5
    fi

    log_info "✅ Prerequisites check passed"
}

create_backup_directory() {
    log_info "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
}

perform_backup() {
    log_info "Starting database backup..."
    log_info "Database: ${POSTGRES_DB}"
    log_info "Container: ${DB_CONTAINER}"
    log_info "Backup file: ${BACKUP_FILE_GZ}"

    # Create backup using pg_dump
    docker exec -t "${DB_CONTAINER}" pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        --verbose \
        2>&1 | tee "${BACKUP_DIR}/${BACKUP_FILE}"

    # Check if backup was successful
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        log_error "Database backup failed!"
        exit 1
    fi

    # Compress backup
    log_info "Compressing backup..."
    gzip -f "${BACKUP_DIR}/${BACKUP_FILE}"

    # Get backup file size
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE_GZ}" | cut -f1)

    log_info "✅ Backup completed successfully!"
    log_info "Backup size: ${BACKUP_SIZE}"
    log_info "Backup location: ${BACKUP_DIR}/${BACKUP_FILE_GZ}"
}

verify_backup() {
    log_info "Verifying backup integrity..."

    # Check if file exists and is not empty
    if [ ! -s "${BACKUP_DIR}/${BACKUP_FILE_GZ}" ]; then
        log_error "Backup file is empty or doesn't exist!"
        exit 1
    fi

    # Test gzip integrity
    if ! gzip -t "${BACKUP_DIR}/${BACKUP_FILE_GZ}" 2>/dev/null; then
        log_error "Backup file is corrupted!"
        exit 1
    fi

    log_info "✅ Backup integrity verified"
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."

    # Find and delete backups older than retention period
    DELETED_COUNT=$(find "${BACKUP_DIR}" -name "rmg_erp_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)

    if [ ${DELETED_COUNT} -gt 0 ]; then
        log_info "Deleted ${DELETED_COUNT} old backup(s)"
    else
        log_info "No old backups to delete"
    fi
}

list_recent_backups() {
    log_info "Recent backups:"
    echo ""
    find "${BACKUP_DIR}" -name "rmg_erp_backup_*.sql.gz" -type f -printf "%T@ %Tc %s %p\n" | \
        sort -rn | \
        head -5 | \
        awk '{printf "  📁 %s %s %s - Size: %sMB\n", $2, $3, $5, int($7/1024/1024)}'
    echo ""
}

create_backup_info() {
    log_info "Creating backup metadata..."

    INFO_FILE="${BACKUP_DIR}/${BACKUP_FILE_GZ}.info"

    cat > "${INFO_FILE}" <<EOF
Backup Information
==================
Database: ${POSTGRES_DB}
Container: ${DB_CONTAINER}
Timestamp: ${TIMESTAMP}
Date: $(date +"%Y-%m-%d %H:%M:%S")
File: ${BACKUP_FILE_GZ}
Size: $(du -h "${BACKUP_DIR}/${BACKUP_FILE_GZ}" | cut -f1)
Host: $(hostname)
User: $(whoami)

Table Counts:
$(docker exec -t "${DB_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "
SELECT
    schemaname,
    tablename,
    (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT
    schemaname,
    tablename,
    query_to_xml(format('SELECT COUNT(*) as cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
  FROM pg_tables
  WHERE schemaname = 'public'
) t
ORDER BY row_count DESC;
" 2>/dev/null || echo "Could not retrieve table counts")
EOF

    log_info "✅ Backup metadata saved to: ${INFO_FILE}"
}

###############################################################################
# Main Script
###############################################################################

main() {
    echo ""
    log_info "==========================================="
    log_info "  SOUTHERN APPARELS ERP - DATABASE BACKUP"
    log_info "==========================================="
    echo ""

    # Execute backup steps
    check_prerequisites
    create_backup_directory
    perform_backup
    verify_backup
    create_backup_info
    cleanup_old_backups
    list_recent_backups

    echo ""
    log_info "==========================================="
    log_info "  ✅ BACKUP COMPLETED SUCCESSFULLY!"
    log_info "==========================================="
    echo ""
    log_info "Backup file: ${BACKUP_DIR}/${BACKUP_FILE_GZ}"
    log_info "To restore this backup, run:"
    log_info "  ./scripts/restore-database.sh ${BACKUP_FILE_GZ}"
    echo ""
}

# Run main function
main
