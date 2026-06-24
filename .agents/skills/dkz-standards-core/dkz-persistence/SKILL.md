---
name: dkz-persistence
description: DEVKiTZ Persistence Rules (DEEPKEEP, Iceberg, LocalStorage).
---

# DEVKiTZ Persistence & DEEPKEEP™

1. **LocalStorage First**: Web modules must operate offline-first using localStorage.
2. **Iceberg Analytics**: Backend processes log to DuckDB/Apache Iceberg for long-term analytics.
3. **Triple Anchoring**: All AI artifacts (Task, Plan, Walkthrough) must be saved locally and indexed by James.
4. **DEEPKEEP™**: The 7-day-rule applies. Do not delete files without permission; move them to 99_ARCHIVE/.
