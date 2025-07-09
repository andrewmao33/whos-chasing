from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import stat
import glob
import pandas as pd
import numpy as np
from urllib.parse import unquote
from datetime import timedelta
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
            JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
            JOIN chat c ON cmj.chat_id = c.ROWID
            WHERE m.text IS NOT NULL 
            AND datetime(m.date / 1000000000 + 978307200, 'unixepoch') >= datetime('now', '-1 year')
            AND c.ROWID IN (
                SELECT chat_id
                FROM chat_handle_join
                GROUP BY chat_id
                HAVING COUNT(DISTINCT handle_id) = 1
            )
            GROUP BY h.id
        )
        SELECT DISTINCT v.ZFULLNUMBER, ZFIRSTNAME, ZLASTNAME, mc.message_count
        FROM ZABCDPHONENUMBER v
        JOIN ZABCDRECORD p ON v.ZOWNER = p.Z_PK
        JOIN message_counts mc ON v.ZFULLNUMBER = mc.handle
        ORDER BY mc.message_count DESC
        LIMIT 20;
    """)

    contacts = cursor.fetchall()
    return {"contacts": contacts}

@app.get("/conversation/{phone_number}")
def get_conversation(phone_number: str):
    # Decode the URL-encoded phone number
    decoded_phone = unquote(phone_number)
    print(f"Original: {phone_number}, Decoded: {decoded_phone}")

    # select all messages from the chat database for the given phone number, no group chats
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
        ORDER BY m.date
    """, (decoded_phone,))
    messages = cursor.fetchall()
    
    if not messages:
        return {"error": f"No messages found for {decoded_phone}"}
    
    df = pd.DataFrame(messages, columns=['timestamp', 'is_from_me', 'handle', 'text'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s', utc=True) # add timezone info

    sent, received = get_count_info(df)
    response_time = response_time_analysis(df)

    return {"messages": messages, 
            "sent": sent, 
            "received": received, 
            "my_mean": response_time["my_mean"],
            "my_median": response_time["my_median"],
            "my_max": response_time["my_max"],
            "my_slowest_reply": response_time["my_slowest_reply"],
            "their_mean": response_time["their_mean"],
            "their_median": response_time["their_median"],
            "their_max": response_time["their_max"],
            "their_slowest_reply": response_time["their_slowest_reply"],
            "my_one_text_responses": response_time["my_one_text_responses"],
            "their_one_text_responses": response_time["their_one_text_responses"],
            "my_one_word_responses": response_time["my_one_word_responses"],
            "their_one_word_responses": response_time["their_one_word_responses"]}

def get_count_info(chat):
    sent = chat[chat['is_from_me'] == 1].shape[0]
    received = chat[chat['is_from_me'] == 0].shape[0]
    return sent, received

def response_time_analysis(chat):
    my_response_times = []
    their_response_times = []

    my_text_counts = []
    their_text_counts = []

    my_one_text_responses = 0
    their_one_text_responses = 0

    my_one_word_responses = 0
    their_one_word_responses = 0

    my_slowest_reply_time = 0
    their_slowest_reply_time = 0

    my_slowest_reply = ""
    their_slowest_reply = ""

    # New: list of one-word responses for tracking
    one_word_rows = []

    # Iteration state
    prev_time = None
    prev_sender = None
    curr_num_messages = 1

    for idx, row in chat.iterrows():
        curr_time = row['timestamp']
        curr_sender = row['is_from_me']  # 1 = you, 0 = them
        curr_text = row['text']

        if prev_time is not None and curr_sender != prev_sender:
            response_time = (curr_time - prev_time).total_seconds()
            time_str = str(timedelta(seconds=int(response_time)))
            word_count = len(prev_text.strip().split())

            if curr_sender == 1:
                my_response_times.append(response_time)
                their_text_counts.append(curr_num_messages)
                if curr_num_messages == 1:
                    their_one_text_responses += 1
                    if word_count == 1:
                        their_one_word_responses += 1
                        one_word_rows.append({
                            'timestamp': curr_time,
                            'sender': 'them',
                            'text': prev_text,
                            'response_time_sec': response_time
                        })
                if response_time > my_slowest_reply_time:
                    my_slowest_reply = f"you responded with '{curr_text}' to '{prev_text}' after {time_str} on {curr_time}"
                    my_slowest_reply_time = response_time
            else:
                their_response_times.append(response_time)
                my_text_counts.append(curr_num_messages)
                if curr_num_messages == 1:
                    my_one_text_responses += 1
                    if word_count == 1:
                        my_one_word_responses += 1
                        one_word_rows.append({
                            'timestamp': curr_time,
                            'sender': 'you',
                            'text': prev_text,
                            'response_time_sec': response_time
                        })
                if response_time > their_slowest_reply_time:
                    their_slowest_reply = f"they responded with '{curr_text}' to '{prev_text}' after {time_str} on {curr_time}"
                    their_slowest_reply_time = response_time

            curr_num_messages = 1
        else:
            curr_num_messages += 1

        prev_time = curr_time
        prev_sender = curr_sender
        prev_text = curr_text

    # Convert to DataFrame
    one_word_df = pd.DataFrame(one_word_rows)

    # Handle empty response times
    if my_response_times:
        my_mean = str(timedelta(seconds=int(np.mean(my_response_times))))
        my_median = str(timedelta(seconds=int(np.median(my_response_times))))
        my_max = str(timedelta(seconds=int(np.max(my_response_times))))
    else:
        my_mean = "No responses"
        my_median = "No responses"
        my_max = "No responses"

    if their_response_times:
        their_mean = str(timedelta(seconds=int(np.mean(their_response_times))))
        their_median = str(timedelta(seconds=int(np.median(their_response_times))))
        their_max = str(timedelta(seconds=int(np.max(their_response_times))))
    else:
        their_mean = "No responses"
        their_median = "No responses"
        their_max = "No responses"

    return {
        "my_mean": my_mean,
        "my_median": my_median,
        "my_max": my_max,
        "my_slowest_reply": my_slowest_reply or "No responses",
        "their_mean": their_mean,
        "their_median": their_median,
        "their_max": their_max,
        "their_slowest_reply": their_slowest_reply or "No responses",
        "my_one_text_responses": my_one_text_responses,
        "their_one_text_responses": their_one_text_responses,
        "my_one_word_responses": my_one_word_responses,
        "their_one_word_responses": their_one_word_responses,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)