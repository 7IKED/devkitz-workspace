import sqlite3, sys, os
sys.stdout.reconfigure(encoding='utf-8')

db = r'C:\DEVKiTZ\99_ARCHIVE\_DRIVE_CACHE_RESCUE_2026-05-28_1149\mirror_sqlite.db'
conn = sqlite3.connect(db)
c = conn.cursor()

# Finde den DkzAutoSorter und seine Details
print("=== DkzAutoSorter DETAILS ===\n")
c.execute("""
    SELECT local_stable_id, stable_id, local_filename, cloud_filename, 
           local_size, cloud_size, local_mtime_ms, cloud_mtime_ms,
           parent_local_stable_id
    FROM mirror_item 
    WHERE local_filename LIKE '%DkzAutoSorter%' OR local_filename LIKE '%DriveOrganizer%'
       OR local_filename LIKE '%DuplicateDetector%' OR local_filename LIKE '%Code.gs%'
       OR local_filename LIKE '%gdrive-backup%'
    ORDER BY local_filename
""")
scripts = c.fetchall()
for s in scripts:
    from datetime import datetime
    mtime = ""
    if s[7]:
        mtime = datetime.fromtimestamp(s[7]/1000).strftime('%Y-%m-%d %H:%M')
    elif s[6]:
        mtime = datetime.fromtimestamp(s[6]/1000).strftime('%Y-%m-%d %H:%M')
    
    print(f"  Name: {s[2] or s[3]}")
    print(f"  Size: {s[4] or s[5]} bytes")
    print(f"  Modified: {mtime}")
    print(f"  Local ID: {s[0]}, Stable ID: {s[1]}, Parent: {s[8]}")
    
    # Find parent folder name
    c.execute("SELECT local_filename FROM mirror_item WHERE local_stable_id = ?", (s[8],))
    parent = c.fetchone()
    if parent:
        print(f"  Parent folder: {parent[0]}")
    print()

# Find the parent project folder
print("\n=== APPS SCRIPT PROJEKTE (Ordner) ===\n")
c.execute("""
    SELECT DISTINCT mi2.local_filename, mi2.local_stable_id
    FROM mirror_item mi
    JOIN mirror_item mi2 ON mi.parent_local_stable_id = mi2.local_stable_id
    WHERE mi.local_filename LIKE '%.gs'
    ORDER BY mi2.local_filename
""")
projects = c.fetchall()
for p in projects:
    print(f"\n  Projekt: {p[0]}")
    c.execute("""
        SELECT local_filename, local_size FROM mirror_item 
        WHERE parent_local_stable_id = ? ORDER BY local_filename
    """, (p[1],))
    for f in c.fetchall():
        print(f"    {f[0]} ({f[1] or '?'} bytes)")

conn.close()
