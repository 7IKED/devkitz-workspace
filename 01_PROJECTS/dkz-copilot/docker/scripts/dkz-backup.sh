#!/bin/bash
# dkz-backup.sh — Naechtliches Backup vom Rechner
# ================================================
# REGEL #0: NIE loeschen. Archiv waechst nur.
# Cron: 0 3 * * * /opt/dkz/dkz-backup.sh
# ================================================

set -euo pipefail

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H%M%S)
BACKUP_DIR="/opt/dkz-backup/$DATE"
ARCHIVE_DIR="/opt/dkz-backup/archive"
LOG_FILE="/opt/dkz-backup/logs/backup_${DATE}_${TIME}.log"
LOCK_FILE="/tmp/dkz-backup.lock"

# Doppelstart verhindern
if [ -f "$LOCK_FILE" ]; then
    echo "Backup laeuft bereits (Lock: $LOCK_FILE)" | tee -a "$LOG_FILE"
    exit 1
fi
trap "rm -f $LOCK_FILE" EXIT
touch "$LOCK_FILE"

mkdir -p "$BACKUP_DIR" "$ARCHIVE_DIR" "$(dirname $LOG_FILE)"

echo "=== DkZ Backup Start: $DATE $TIME ===" | tee -a "$LOG_FILE"
echo "REGEL #0: Archiv waechst nur. NIE loeschen." | tee -a "$LOG_FILE"

# 1. Rsync vom Rechner (wenn erreichbar)
echo "--- Phase 1: Rsync vom Rechner ---" | tee -a "$LOG_FILE"
if rsync -avz --timeout=30 \
    --exclude='node_modules/' \
    --exclude='.git/objects/' \
    --exclude='dist/' \
    --exclude='*.log' \
    --exclude='__pycache__/' \
    777@rechner:/c/DEVKiTZ/ "$BACKUP_DIR/" >> "$LOG_FILE" 2>&1; then
    echo "Rsync OK" | tee -a "$LOG_FILE"
else
    echo "Rsync FEHLGESCHLAGEN — Rechner nicht erreichbar" | tee -a "$LOG_FILE"
    # Fallback: Lokales Git-Backup
    if [ -d "/opt/dkz-workspace" ]; then
        echo "Fallback: Lokales Git Pull" | tee -a "$LOG_FILE"
        cd /opt/dkz-workspace && git pull origin main >> "$LOG_FILE" 2>&1 || true
    fi
fi

# 2. Versioniertes Archiv (IMMER, NIE loeschen!)
echo "--- Phase 2: Archiv erstellen ---" | tee -a "$LOG_FILE"
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    tar czf "$ARCHIVE_DIR/dkz-${DATE}_${TIME}.tar.gz" "$BACKUP_DIR/" 2>> "$LOG_FILE"
    ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR/dkz-${DATE}_${TIME}.tar.gz" | cut -f1)
    echo "Archiv: $ARCHIVE_SIZE" | tee -a "$LOG_FILE"
fi

# 3. Google Drive Sync (alle 6h, 0/6/12/18 Uhr)
HOUR=$(date +%H)
if [ "$HOUR" = "00" ] || [ "$HOUR" = "06" ] || [ "$HOUR" = "12" ] || [ "$HOUR" = "18" ]; then
    echo "--- Phase 3: Google Drive Sync ---" | tee -a "$LOG_FILE"
    if command -v rclone &> /dev/null; then
        rclone sync "$BACKUP_DIR/" gdrive:DEVKiTZ-Backup/$DATE/ \
            --transfers=4 --checkers=8 >> "$LOG_FILE" 2>&1 || \
            echo "Drive Sync FEHLGESCHLAGEN" | tee -a "$LOG_FILE"
    else
        echo "rclone nicht installiert — Skip Drive Sync" | tee -a "$LOG_FILE"
    fi
fi

# 4. Cloudflare R2 (am 1. des Monats)
if [ "$(date +%d)" = "01" ]; then
    echo "--- Phase 4: R2 Cold Storage ---" | tee -a "$LOG_FILE"
    MONTH=$(date +%Y-%m)
    if command -v rclone &> /dev/null; then
        rclone copy "$ARCHIVE_DIR/" r2:dkz-archive/$MONTH/ \
            --transfers=4 >> "$LOG_FILE" 2>&1 || \
            echo "R2 Sync FEHLGESCHLAGEN" | tee -a "$LOG_FILE"
    fi
fi

# 5. Cleanup: Tages-Ordner nach 30 Tagen ins Archiv verschieben (NIE loeschen!)
echo "--- Phase 5: Cleanup (move only, NEVER delete) ---" | tee -a "$LOG_FILE"
find /opt/dkz-backup/ -maxdepth 1 -type d -mtime +30 \
    -not -name 'archive' -not -name 'logs' \
    -exec mv {} "$ARCHIVE_DIR/" \; 2>> "$LOG_FILE" || true

# Stats
ARCHIVE_COUNT=$(find "$ARCHIVE_DIR" -name "*.tar.gz" | wc -l)
ARCHIVE_TOTAL=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1 || echo "0")
echo "" | tee -a "$LOG_FILE"
echo "=== Backup Fertig ===" | tee -a "$LOG_FILE"
echo "  Datum:    $DATE" | tee -a "$LOG_FILE"
echo "  Archive:  $ARCHIVE_COUNT Stueck ($ARCHIVE_TOTAL)" | tee -a "$LOG_FILE"
echo "  Regel #0: Nichts geloescht" | tee -a "$LOG_FILE"
echo "=====================" | tee -a "$LOG_FILE"
