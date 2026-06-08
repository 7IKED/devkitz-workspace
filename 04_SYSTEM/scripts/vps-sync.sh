#!/bin/bash
# ═══════════════════════════════════════
# DkZ™ VPS Auto-Sync — GitHub → VPS → Dashboard
# Cron: */5 * * * * /opt/dkz/sync.sh >> /var/log/dkz-sync.log 2>&1
# ═══════════════════════════════════════

REPO_DIR="/var/www/devkitz-repo"
DASHBOARD_DIR="/var/www/01_PROJECTS/01_dashboard"
LOG_DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$LOG_DATE] === DkZ Sync Start ==="

# 1. Pull von GitHub
cd "$REPO_DIR" || exit 1
git fetch origin main --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "[$LOG_DATE] Kein Update — $LOCAL"
    exit 0
fi

echo "[$LOG_DATE] Update gefunden: $LOCAL → $REMOTE"
git pull origin main --quiet

# 2. Sync relevante Verzeichnisse zum Dashboard
echo "[$LOG_DATE] Sync: workflows, skills, prompts, agents..."

# Workflows
rsync -a --delete "$REPO_DIR/.agents/workflows/" "$DASHBOARD_DIR/../.agents/workflows/" 2>/dev/null

# Skills  
rsync -a --delete "$REPO_DIR/.agents/skills/" "$DASHBOARD_DIR/../.agents/skills/" 2>/dev/null

# Prompts
rsync -a --delete "$REPO_DIR/.github/prompts/" "$DASHBOARD_DIR/.github/prompts/" 2>/dev/null

# Agents
rsync -a --delete "$REPO_DIR/.agents/agents/" "$DASHBOARD_DIR/../.agents/agents/" 2>/dev/null

# Dashboard Module (nur neue/geaenderte)
rsync -a "$REPO_DIR/01_PROJECTS/01_dashboard/modules/" "$DASHBOARD_DIR/modules/" 2>/dev/null
rsync -a "$REPO_DIR/01_PROJECTS/01_dashboard/landing-pages/" "$DASHBOARD_DIR/landing-pages/" 2>/dev/null
rsync -a "$REPO_DIR/01_PROJECTS/01_dashboard/shared/" "$DASHBOARD_DIR/shared/" 2>/dev/null
rsync -a "$REPO_DIR/01_PROJECTS/01_dashboard/mainboard/" "$DASHBOARD_DIR/mainboard/" 2>/dev/null
rsync -a "$REPO_DIR/01_PROJECTS/01_dashboard/hub/" "$DASHBOARD_DIR/hub/" 2>/dev/null

# 3. Nginx reload (nur wenn Config geaendert)
nginx -t 2>/dev/null && systemctl reload nginx

COMMIT_MSG=$(git log -1 --pretty=format:'%s')
echo "[$LOG_DATE] ✅ Sync komplett: $COMMIT_MSG"
echo "[$LOG_DATE] === DkZ Sync Ende ==="
