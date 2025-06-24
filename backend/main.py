from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import stat
import glob
from urllib.parse import unquote

from fastapi.openapi.models import Contact

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# messages
CHAT_DB_PATH = os.path.expanduser("~/Library/Messages/chat.db")
# contacts
base_path = os.path.expanduser("~/Library/Application Support/AddressBook/Sources")
db_files = glob.glob(os.path.join(base_path, "*", "AddressBook-v22.abcddb"))
CONTACTS_DB_PATH = db_files[0]

@app.get("/")
def read_root():
    return {"message": "iMessage API is running"}

@app.get("/contacts")
def get_contacts():
    # select all contacts from the contacts database, ordered by number of messages exchanged in the past year
    conn = sqlite3.connect(CONTACTS_DB_PATH)
    conn.execute(f"ATTACH DATABASE '{CHAT_DB_PATH}' AS chat")

    cursor = conn.cursor()
    cursor.execute("""
        WITH message_counts AS (
            SELECT h.id AS handle, COUNT(m.ROWID) AS message_count
            FROM message m
            JOIN handle h ON m.handle_id = h.rowid
            WHERE m.text IS NOT NULL 
            AND datetime(m.date / 1000000000 + 978307200, 'unixepoch') >= datetime('now', '-1 year')
            GROUP BY h.id
        )
        SELECT DISTINCT v.ZFULLNUMBER, ZFIRSTNAME, ZLASTNAME
        FROM ZABCDPHONENUMBER v
        JOIN ZABCDRECORD p ON v.ZOWNER = p.Z_PK
        JOIN message_counts mc ON v.ZFULLNUMBER = mc.handle
        ORDER BY mc.message_count DESC
        LIMIT 10;
    """)

    contacts = cursor.fetchall()
    return {"contacts": contacts}

@app.get("/conversation/{phone_number}")
def get_conversation(phone_number: str):
    print(phone_number)

    conn = sqlite3.connect(CHAT_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            m.date / 1000000000 + strftime('%s','2001-01-01') AS timestamp,
            m.is_from_me,
            h.id AS handle,
            m.text
        FROM message m
        JOIN handle h ON m.handle_id = h.ROWID
        JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
        JOIN chat c ON cmj.chat_id = c.ROWID
        JOIN chat_handle_join chj ON c.ROWID = chj.chat_id
        JOIN handle h2 ON chj.handle_id = h2.ROWID
        WHERE m.text IS NOT NULL
        AND h2.id = ?
        AND c.ROWID IN (
            SELECT chat_id
            FROM chat_handle_join
            GROUP BY chat_id
            HAVING COUNT(DISTINCT handle_id) = 1
  )
    """, (phone_number,))
    messages = cursor.fetchall()
    
    return {"messages": messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)