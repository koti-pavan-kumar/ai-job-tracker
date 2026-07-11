import sqlite3
import os
import hashlib

# Path to your local SQLite file
db_path = os.path.join("backend", "job_tracker.db")
if not os.path.exists(db_path):
    db_path = "job_tracker.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Analyzing database workspace users...")

try:
    cursor.execute("SELECT id, username, is_admin FROM users;")
    all_users = cursor.fetchall()
except sqlite3.OperationalError:
    all_users = []

if all_users:
    print("Found existing local users:")
    for uid, name, is_adm in all_users:
        print(f" - ID: {uid} | Username: {name} | Admin Status: {is_adm}")
    
    first_username = all_users[0][1]
    cursor.execute("UPDATE users SET is_admin = 1 WHERE username = ?;", (first_username,))
    conn.commit()
    print(f"Success! Existing local account '{first_username}' has been updated to Administrator.")
else:
    print("No local users found in the database table.")
    print("Creating a brand new local admin account profile for you...")
    
    # Simulate a basic hash format string structure that matches structural formats
    # using simple cryptographic placeholders
    dummy_hash = "$2b$12$VvS0vX5r58vV6f7G7V7v7uNnNzNzNzNzNzNzNzNzNzNzNzNzNzNzm"
    
    try:
        cursor.execute(
            "INSERT INTO users (username, hashed_password, phone, is_admin) VALUES (?, ?, ?, ?);",
            ("whitedevil", dummy_hash, "+919999999999", 1)
        )
        conn.commit()
        print("Success! Created a new admin account setup container.")
        print(" -> Username: whitedevil")
        print(" -> Note: If password123 doesn't pass, click 'Reset Access' on the UI with phone +919999999999 to configure a permanent key!")
    except Exception as e:
        print(f"Error creating fallback account: {e}")

conn.close()