#!/bin/bash
set -euo pipefail

# Function to log messages
log() {
	echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Set default values for optional environment variables
RETENTION_DAYS="${RETENTION_DAYS:-14}"
S3_BACKUP_PATH="${S3_BACKUP_PATH-}"

# Ensure S3_BACKUP_PATH does not end with a slash
S3_BACKUP_PATH="${S3_BACKUP_PATH%/}"

# Check for required environment variables
required_env_vars=(
	INFLUX_HOST
	INFLUX_PORT
	INFLUX_ORG
	INFLUX_BUCKET
	INFLUX_TOKEN
	S3_ENDPOINT
	S3_REGION
	S3_ACCESS_KEY
	S3_SECRET_KEY
	S3_BUCKET
)
for var in "${required_env_vars[@]}"; do
	if [[ -z ${!var-} ]]; then
		echo "Error: Environment variable ${var} is not set."
		exit 1
	fi
done

# Export S3 credentials for s5cmd
export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_KEY}"
export AWS_REGION="${S3_REGION}"

# Generate a timestamp for the backup
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Define backup directory and compressed file names
BACKUP_DIR="./influxdb_${TIMESTAMP}"
BACKUP_ARCHIVE="./influxdb_${TIMESTAMP}.tar.gz"

# Create the backup directory
log "Creating backup directory at ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

# Perform the backup using InfluxDB CLI
log "Starting InfluxDB backup..."
influx backup \
	--host "http://${INFLUX_HOST}:${INFLUX_PORT}" \
	--org "${INFLUX_ORG}" \
	--bucket "${INFLUX_BUCKET}" \
	--token "${INFLUX_TOKEN}" \
	"${BACKUP_DIR}"

log "InfluxDB backup completed successfully."

# Compress the backup directory
log "Compressing backup directory..."
tar -czf "${BACKUP_ARCHIVE}" -C "$(dirname "${BACKUP_DIR}")" "$(basename "${BACKUP_DIR}")"

log "Compression completed."

# Upload the compressed backup to S3-compatible storage
S3_DESTINATION="s3://${S3_BUCKET}/${TIMESTAMP}.tar.gz"
RETENTION_SECONDS=$((RETENTION_DAYS * 86400))
EXPIRES_DATE=$(date -u -Iseconds --date="@$(($(date +%s) + RETENTION_SECONDS))")

log "Uploading backup to ${S3_DESTINATION}"
s5cmd --endpoint-url "${S3_ENDPOINT}" cp -n -s -u --expires "${EXPIRES_DATE}" "${BACKUP_ARCHIVE}" "${S3_DESTINATION}"

log "Backup uploaded successfully to ${S3_DESTINATION}, expires on ${EXPIRES_DATE}."

# Clean up local backup files
log "Cleaning up local backup files..."
rm -rf "${BACKUP_DIR}" "${BACKUP_ARCHIVE}"

log "Backup and cleanup process completed."
