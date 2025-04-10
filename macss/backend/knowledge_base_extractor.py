#!/usr/bin/env python
"""
Knowledge Base Extractor

This script analyzes the provided conversation files and extracts
knowledge base entries based on the problems and solutions found.
"""

import re
import json
import sqlite3

def connect_to_db():
    """Connect to the SQLite database"""
    conn = sqlite3.connect('macss.db')
    conn.row_factory = sqlite3.Row
    return conn

def analyze_conversation(content):
    """Analyze a conversation to extract knowledge base information"""
    
    # Extract metadata
    lines = content.split('\n')
    
    try:
        conversation_id = re.search(r'Conversation ID: (.*)', lines[0]).group(1)
        category = re.search(r'Category: (.*)', lines[1]).group(1)
        sentiment_priority = lines[2].split('|')
        sentiment = sentiment_priority[0].replace('Sentiment:', '').strip()
        priority = sentiment_priority[1].replace('Priority:', '').strip()
        
        # Extract problem and solution
        problem = ""
        solution = ""
        
        # Find the first customer message (problem description)
        for i, line in enumerate(lines):
            if line.startswith("Customer:"):
                problem = line.replace("Customer:", "").strip()
                if i + 1 < len(lines) and not lines[i+1].startswith("Agent:"):
                    problem += " " + lines[i+1].strip()
                break
        
        # Find the last agent message (likely solution)
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].startswith("Agent:"):
                solution = lines[i].replace("Agent:", "").strip()
                break
        
        # Extract key technical terms
        technical_terms = []
        terms_regex = re.compile(r'\b(API|SSL|TLS|sync token|cache|permissions|antivirus|update|installation|force sync|compatibility|thermostat|model|iPhone|version|browser|Wi-Fi|app version|settings|logs|troubleshoot|error|crash|connection|network)\b', re.IGNORECASE)
        found_terms = terms_regex.findall(content)
        if found_terms:
            technical_terms = [term.lower() for term in set(found_terms)]
        
        return {
            "conversation_id": conversation_id,
            "category": category,
            "problem": problem,
            "solution": solution,
            "technical_terms": technical_terms
        }
    except Exception as e:
        print(f"Error analyzing conversation: {e}")
        return None

def extract_knowledge(conversations):
    """Extract knowledge base entries from conversations"""
    
    knowledge_entries = []
    
    for conversation in conversations:
        if not conversation:
            continue
            
        # Create knowledge base title
        if "sync" in conversation["problem"].lower():
            title = "Data Synchronization Issues"
        elif "install" in conversation["problem"].lower() or "update" in conversation["problem"].lower():
            title = "Software Installation Failures"
        elif "crash" in conversation["problem"].lower():
            title = "Application Crash Troubleshooting"
        elif "connect" in conversation["problem"].lower() or "connection" in conversation["problem"].lower():
            title = "Network Connection Problems"
        elif "API" in conversation["problem"] or "payment" in conversation["problem"].lower():
            title = "API Integration Issues"
        else:
            title = f"Troubleshooting {conversation['category']}"
        
        # Create content combining problem and solution
        content = f"Problem: {conversation['problem']}\n\nSolution: {conversation['solution']}"
        
        # Create tags from technical terms
        tags = ",".join(conversation["technical_terms"]) if conversation["technical_terms"] else conversation["category"].lower()
        
        knowledge_entries.append({
            "title": title,
            "content": content,
            "category": conversation["category"],
            "tags": tags
        })
    
    return knowledge_entries

def store_knowledge_base(knowledge_entries):
    """Store knowledge base entries in the database"""
    conn = connect_to_db()
    cursor = conn.cursor()
    
    for entry in knowledge_entries:
        cursor.execute('''
        INSERT INTO knowledge_base (
            issue_category, title, content, tags
        ) VALUES (?, ?, ?, ?)
        ''', (entry["category"], entry["title"], entry["content"], entry["tags"]))
    
    conn.commit()
    conn.close()
    
    print(f"Stored {len(knowledge_entries)} knowledge base entries")

def extract_workflows(conversations):
    """Extract workflow patterns from conversations"""
    
    workflows = []
    
    for conversation in conversations:
        if not conversation:
            continue
            
        # Extract agent actions from the conversation
        agent_actions = []
        
        if "reset" in conversation["solution"].lower():
            agent_actions.append("Reset system components")
        
        if "check" in conversation["solution"].lower() or "verify" in conversation["solution"].lower():
            agent_actions.append("Verify account/system information")
        
        if "settings" in conversation["solution"].lower():
            agent_actions.append("Guide customer through settings changes")
        
        if "clear" in conversation["solution"].lower() and "cache" in conversation["solution"].lower():
            agent_actions.append("Instruct to clear application cache")
        
        if "disable" in conversation["solution"].lower() and "antivirus" in conversation["solution"].lower():
            agent_actions.append("Recommend temporarily disabling antivirus")
        
        if "upgrade" in conversation["solution"].lower() or "update" in conversation["solution"].lower():
            agent_actions.append("Recommend system or protocol upgrade")
        
        if agent_actions:
            workflows.append({
                "id": conversation["conversation_id"],
                "category": conversation["category"],
                "actions": agent_actions
            })
    
    return workflows

def generate_summary_statistics(conversations):
    """Generate summary statistics from conversations"""
    
    categories = {}
    issues = {
        "sync": 0,
        "installation": 0,
        "crash": 0,
        "connection": 0,
        "api": 0,
        "other": 0
    }
    sentiments = {}
    
    for conversation in conversations:
        if not conversation:
            continue
            
        # Count categories
        category = conversation["category"]
        categories[category] = categories.get(category, 0) + 1
        
        # Count issue types
        if "sync" in conversation["problem"].lower():
            issues["sync"] += 1
        elif "install" in conversation["problem"].lower() or "update" in conversation["problem"].lower():
            issues["installation"] += 1
        elif "crash" in conversation["problem"].lower():
            issues["crash"] += 1
        elif "connect" in conversation["problem"].lower() or "connection" in conversation["problem"].lower():
            issues["connection"] += 1
        elif "API" in conversation["problem"] or "payment" in conversation["problem"].lower():
            issues["api"] += 1
        else:
            issues["other"] += 1
    
    return {
        "categories": categories,
        "issues": issues
    }

def main():
    """Main function to extract knowledge from conversation files"""
    conversation_files = [
        "data/Account Synchronization Bug.txt",
        "data/Device Compatibility Error.txt",
        "data/Network Connectivity Issue.txt",
        "data/Payment Gateway Integration Failure.txt",
        "data/Software Installation Failure.txt"
    ]
    
    all_conversations = []
    
    for file_path in conversation_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                conversation = analyze_conversation(content)
                if conversation:
                    all_conversations.append(conversation)
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
    
    # Extract knowledge base entries
    knowledge_entries = extract_knowledge(all_conversations)
    
    # Store knowledge entries in the database
    store_knowledge_base(knowledge_entries)
    
    # Extract workflows
    workflows = extract_workflows(all_conversations)
    print(f"Extracted {len(workflows)} workflow patterns")
    
    # Generate statistics
    stats = generate_summary_statistics(all_conversations)
    print("Summary Statistics:")
    print(f"Categories: {stats['categories']}")
    print(f"Issue Types: {stats['issues']}")
    
    print("Knowledge extraction completed successfully")

if __name__ == "__main__":
    main()