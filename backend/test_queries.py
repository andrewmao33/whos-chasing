import sqlite3
import os
import re
import glob
from typing import Dict, Optional, List
import pandas as pd

CHAT_DB_PATH = os.path.expanduser("~/Library/Messages/chat.db")
# contacts
base_path = os.path.expanduser("~/Library/Application Support/AddressBook/Sources")
db_files = glob.glob(os.path.join(base_path, "*", "AddressBook-v22.abcddb"))
CONTACTS_DB_PATH = db_files[0]


conn = sqlite3.connect(CHAT_DB_PATH)
conn.execute(f"ATTACH DATABASE '{CONTACTS_DB_PATH}' AS contacts")

cursor = conn.cursor()
cursor.execute("""
    WITH contacts AS (
        SELECT DISTINCT ZFULLNUMBER, ZFIRSTNAME, ZLASTNAME
        FROM ZABCDPHONENUMBER v
        JOIN ZABCDRECORD p ON v.ZOWNER = p.Z_PK
    ),
    messages AS (
        SELECT
            m.date / 1000000000 + strftime('%s','2001-01-01') AS timestamp,
            m.is_from_me,
            h.id AS handle,
            m.text
        FROM message m
        JOIN handle h ON m.handle_id = h.rowid
        WHERE m.text IS NOT NULL
    )
    SELECT *
    FROM contacts c JOIN messages m ON c.ZFULLNUMBER = m.handle
    WHERE m.handle = '+18479900159' 
    LIMIT 10;
""")
            
phone_results = cursor.fetchall()

cursor.execute("""
    WITH message_counts AS (
            SELECT h.id AS handle, COUNT(m.ROWID) AS message_count
        FROM message m
        JOIN handle h ON m.handle_id = h.rowid
        WHERE m.text IS NOT NULL 
        AND (m.date / 1000000000 + strftime('%s', '2001-01-01')) >= strftime('%s', 'now', '-1 year')
        GROUP BY h.id
    )
    SELECT DISTINCT v.ZFULLNUMBER, ZFIRSTNAME, mc.message_count
    FROM ZABCDPHONENUMBER v
    JOIN ZABCDRECORD p ON v.ZOWNER = p.Z_PK
    JOIN message_counts mc ON v.ZFULLNUMBER = mc.handle
    ORDER BY mc.message_count DESC
    LIMIT 10;
""")
contacts = cursor.fetchall()
print(contacts)
