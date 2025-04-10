import sqlite3
import csv
import os
import re
from datetime import datetime
import json

def create_database():
    """Create the SQLite database with schema matching the provided dataset."""
    # Check if database file already exists and remove if it does
    if os.path.exists('macss.db'):
        os.remove('macss.db')
    
    # Connect to database
    conn = sqlite3.connect('macss.db')
    cursor = conn.cursor()
    
    # Create tables
    
    # Tickets table - based on the CSV structure
    cursor.execute('''
    CREATE TABLE ticket (
        ticket_id TEXT PRIMARY KEY,
        issue_category TEXT NOT NULL,
        sentiment TEXT,
        priority TEXT,
        solution TEXT,
        resolution_status TEXT,
        date_of_resolution TEXT,
        estimated_resolution_time INTEGER,
        actual_resolution_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Conversations table - for storing the conversation transcripts
    cursor.execute('''
    CREATE TABLE conversation (
        conversation_id TEXT PRIMARY KEY,
        ticket_id TEXT,
        transcript TEXT NOT NULL,
        category TEXT,
        sentiment TEXT,
        priority TEXT,
        FOREIGN KEY (ticket_id) REFERENCES ticket (ticket_id)
    )
    ''')
    
    # Messages table - for individual messages in conversations
    cursor.execute('''
    CREATE TABLE message (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,  -- "customer" or "agent"
        message_text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversation (conversation_id)
    )
    ''')
    
    # Summaries table - for agent-generated summaries
    cursor.execute('''
    CREATE TABLE summary (
        summary_id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        content TEXT NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confidence_score REAL,
        FOREIGN KEY (conversation_id) REFERENCES conversation (conversation_id)
    )
    ''')
    
    # Actions table - for extracted actions
    cursor.execute('''
    CREATE TABLE action_item (
        action_id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY (conversation_id) REFERENCES conversation (conversation_id)
    )
    ''')
    
    # Knowledge base table
    cursor.execute('''
    CREATE TABLE knowledge_base (
        kb_id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_category TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    print("Database schema created successfully.")
    return conn

def parse_conversation_file(file_path):
    """Parse a conversation text file into structured data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract metadata from the first few lines
    lines = content.split('\n')
    conversation_id = re.search(r'Conversation ID: (.*)', lines[0]).group(1)
    category = re.search(r'Category: (.*)', lines[1]).group(1)
    sentiment_priority = lines[2].split('|')
    sentiment = sentiment_priority[0].replace('Sentiment:', '').strip()
    priority = sentiment_priority[1].replace('Priority:', '').strip()
    
    # Extract messages from the conversation
    messages = []
    current_sender = None
    current_message = ""
    
    for line in lines[3:]:
        # Check if this line starts a new message
        if line.startswith("Customer:") or line.startswith("Agent:"):
            # Save previous message if exists
            if current_sender:
                messages.append({
                    "sender": current_sender,
                    "text": current_message.strip()
                })
            
            # Start new message
            if line.startswith("Customer:"):
                current_sender = "customer"
                current_message = line.replace("Customer:", "").strip()
            else:
                current_sender = "agent"
                current_message = line.replace("Agent:", "").strip()
        else:
            # Continue current message
            current_message += " " + line.strip()
    
    # Add the last message
    if current_sender:
        messages.append({
            "sender": current_sender,
            "text": current_message.strip()
        })
    
    return {
        "conversation_id": conversation_id,
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
        "messages": messages,
        "full_transcript": content
    }

def import_conversation_files(cursor, conversation_files):
    """Import conversation files into the database."""
    for file_path in conversation_files:
        try:
            conversation_data = parse_conversation_file(file_path)
            
            # Insert the conversation
            cursor.execute('''
            INSERT INTO conversation (
                conversation_id, category, sentiment, priority, transcript
            ) VALUES (?, ?, ?, ?, ?)
            ''', (
                conversation_data["conversation_id"],
                conversation_data["category"],
                conversation_data["sentiment"],
                conversation_data["priority"],
                conversation_data["full_transcript"]
            ))
            
            # Insert individual messages
            for message in conversation_data["messages"]:
                cursor.execute('''
                INSERT INTO message (
                    conversation_id, sender_type, message_text
                ) VALUES (?, ?, ?)
                ''', (
                    conversation_data["conversation_id"],
                    message["sender"],
                    message["text"]
                ))
            
            # Create a ticket record for this conversation if not exists
            ticket_id = "T" + conversation_data["conversation_id"]
            cursor.execute('''
            INSERT OR IGNORE INTO ticket (
                ticket_id, issue_category, sentiment, priority
            ) VALUES (?, ?, ?, ?)
            ''', (
                ticket_id,
                conversation_data["category"],
                conversation_data["sentiment"],
                conversation_data["priority"]
            ))
            
            # Update the conversation with the ticket_id
            cursor.execute('''
            UPDATE conversation
            SET ticket_id = ?
            WHERE conversation_id = ?
            ''', (ticket_id, conversation_data["conversation_id"]))
            
            print(f"Imported conversation: {conversation_data['conversation_id']}")
            
        except Exception as e:
            print(f"Error importing {file_path}: {e}")

def import_csv_data(cursor, csv_file_path):
    """Import ticket data from CSV file."""
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            csv_reader = csv.DictReader(f)
            for row in csv_reader:
                # Clean column names (remove leading/trailing spaces)
                clean_row = {k.strip(): v for k, v in row.items()}
                
                cursor.execute('''
                INSERT OR REPLACE INTO ticket (
                    ticket_id,
                    issue_category,
                    sentiment,
                    priority,
                    solution,
                    resolution_status,
                    date_of_resolution
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    clean_row['Ticket ID'],
                    clean_row['Issue Category'],
                    clean_row['Sentiment'],
                    clean_row['Priority'],
                    clean_row['Solution'],
                    clean_row['Resolution Status'],
                    clean_row['Date of Resolution']
                ))
            
            print(f"Imported data from CSV: {csv_file_path}")
    except Exception as e:
        print(f"Error importing CSV {csv_file_path}: {e}")

def create_knowledge_base_entries(cursor):
    """Create knowledge base entries based on the imported conversations."""
    # Extract solutions from resolved tickets
    cursor.execute('''
    SELECT issue_category, solution 
    FROM ticket 
    WHERE solution IS NOT NULL AND solution != ''
    ''')
    
    solutions = cursor.fetchall()
    
    # Create knowledge base entries
    for category, solution in solutions:
        title = f"Solution for {category} issue"
        cursor.execute('''
        INSERT INTO knowledge_base (
            issue_category, title, content, tags
        ) VALUES (?, ?, ?, ?)
        ''', (
            category,
            title,
            solution,
            category.lower().replace(' ', ',')
        ))
    
    # Add predefined knowledge entries for technical support
    knowledge_entries = [
        {
            "issue_category": "Technical Support",
            "title": "Sync Issues Troubleshooting",
            "content": "For sync issues between devices: 1. Verify same account on all devices 2. Check sync logs for errors 3. Try Settings > Sync > Force Full Sync 4. Wait 10 minutes for completion.",
            "tags": "sync,account,devices,troubleshooting"
        },
        {
            "issue_category": "Technical Support",
            "title": "Device Compatibility Guidelines",
            "content": "Always check compatibility matrix before updating. Older devices may require app version rollback. Some devices have version caps (e.g. HT-2019 thermostats only work with app versions 5.0 and below).",
            "tags": "compatibility,devices,versions,rollback"
        },
        {
            "issue_category": "Technical Support",
            "title": "Network Connection Problems",
            "content": "For connection issues: 1. Check Local Network permissions 2. Clear app cache 3. Verify network status 4. Try on different network if possible 5. Reinstall if persistent.",
            "tags": "network,connection,permissions,cache"
        },
        {
            "issue_category": "Technical Support",
            "title": "Payment Gateway Integration",
            "content": "Payment API requirements: TLS 1.3 required, valid SSL certificates, proper authentication headers. Use openssl s_client -connect yourgateway.com:443 to verify TLS version.",
            "tags": "payment,api,tls,ssl,integration"
        },
        {
            "issue_category": "Technical Support",
            "title": "Software Installation Troubleshooting",
            "content": "For installation failures: 1. Temporarily disable antivirus 2. Run as administrator 3. Check for disk space issues 4. Update system packages 5. Use direct download links if available.",
            "tags": "installation,antivirus,software,windows"
        }
    ]
    
    for entry in knowledge_entries:
        cursor.execute('''
        INSERT INTO knowledge_base (
            issue_category, title, content, tags
        ) VALUES (?, ?, ?, ?)
        ''', (
            entry["issue_category"],
            entry["title"],
            entry["content"],
            entry["tags"]
        ))
    
    print("Created knowledge base entries successfully.")

def extract_actions_from_conversations(cursor):
    """Extract actions from conversation transcripts."""
    # Get all conversations
    cursor.execute('SELECT conversation_id, transcript FROM conversation')
    conversations = cursor.fetchall()
    
    for conv_id, transcript in conversations:
        # Parse the transcript to find agent actions
        if "reset it manually" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "reset", "Reset sync token manually", "high"))
            
        if "Force Full Sync" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "instruction", "Instruct customer to perform Force Full Sync", "medium"))
            
        if "roll back your app" in transcript or "offer a discount" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "offer", "Offer app rollback or discount on compatible device", "medium"))
            
        if "clear the app cache" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "instruction", "Guide customer to clear app cache", "medium"))
            
        if "Upgrading the protocol" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "technical", "Advise upgrading to TLS 1.3", "high"))
            
        if "disable your antivirus" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "instruction", "Instruct to temporarily disable antivirus", "high"))
            
        if "direct download link" in transcript:
            cursor.execute('''
            INSERT INTO action_item (conversation_id, action_type, description, priority)
            VALUES (?, ?, ?, ?)
            ''', (conv_id, "provide", "Provide direct download link as workaround", "medium"))
    
    print("Extracted actions from conversations successfully.")

def generate_summaries(cursor):
    """Generate conversation summaries."""
    # Get all conversations
    cursor.execute('SELECT conversation_id, transcript FROM conversation')
    conversations = cursor.fetchall()
    
    summaries = {
        "TECH_001": "Customer unable to install design software update due to unknown error at 75%. Agent identified conflict with third-party antivirus. Solution: temporarily disable antivirus and use direct download link. Issue resolved successfully.",
        "TECH_002": "Customer experiencing 'no internet connection' error despite working Wi-Fi. Agent helped check network permissions and clear app cache. Root cause: recent update reset permissions. Issue resolved successfully.",
        "TECH_003": "Customer's smart home app crashes when connecting older thermostat model (HT-2019). Agent identified incompatibility with app version 5.2.1. Solution: offered discount for compatible thermostat as customer declined app rollback.",
        "TECH_004": "Customer experiencing data sync issues between laptop and tablet. Agent found corrupted sync token in logs. Solution: manually reset token and instructed customer to force full sync. Issue resolved, with patch coming next week.",
        "TECH_005": "Customer with urgent API payment gateway integration failure due to 'Invalid SSL certificate' error. Agent diagnosed TLS version mismatch. Solution: upgrade to TLS 1.3. Issue resolved quickly."
    }
    
    for conv_id, transcript in conversations:
        if conv_id in summaries:
            cursor.execute('''
            INSERT INTO summary (conversation_id, content, confidence_score)
            VALUES (?, ?, ?)
            ''', (conv_id, summaries[conv_id], 0.95))
    
    print("Generated summaries successfully.")

def main():
    """Main function to import all data."""
    # Create database and get connection
    conn = create_database()
    cursor = conn.cursor()
    
    # Define conversation files (these would be your actual file paths)
    conversation_files = [
        "data/Account Synchronization Bug.txt",
        "data/Device Compatibility Error.txt",
        "data/Network Connectivity Issue.txt",
        "data/Payment Gateway Integration Failure.txt",
        "data/Software Installation Failure.txt"
    ]
    
    # Import conversation files
    import_conversation_files(cursor, conversation_files)
    
    # Import CSV data
    import_csv_data(cursor, "data/Historical_ticket_data.csv")
    
    # Create knowledge base entries
    create_knowledge_base_entries(cursor)
    
    # Extract actions from conversations
    extract_actions_from_conversations(cursor)
    
    # Generate summaries
    generate_summaries(cursor)
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Data import completed successfully.")

if __name__ == "__main__":
    main()