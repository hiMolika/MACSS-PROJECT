from fastapi import FastAPI, HTTPException, Body, Path 
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.openapi.utils import get_openapi 
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sqlite3
import logging
import asyncio
import re
import json
import random
from datetime import datetime



# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("chat-backend")

# Create FastAPI app
app = FastAPI(
    title="Support Chat API",
    description="Backend API for the Customer Support Chat Interface",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection function
def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect('macss.db')
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

# Models
class Message(BaseModel):
    text: str
    sender: str = "user"

class ConversationResponse(BaseModel):
    message: str
    action_items: Optional[List[Dict[str, Any]]] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    priority: Optional[str] = None
    estimated_time: Optional[int] = None
    conversation_id: Optional[str] = None

class ActionItem(BaseModel):
    action_type: str
    description: str
    priority: str

# Simulated AI Agent for processing messages
class AIAgent:
    def _init_(self):
        self.db_conn = get_db_connection()
        self.current_conversation_id = None
        
        # Add this line to define sentiment_map
        self.sentiment_map = {
            "Frustrated": ["frustrated", "annoyed", "upset", "angry"],
            "Anxious": ["anxious", "worried", "concerned", "nervous"],
            "Confused": ["confused", "lost", "unsure", "don't understand"],
            "Urgent": ["urgent", "immediately", "asap", "right away"],
            "Annoyed": ["annoyed", "irritated", "bothered", "fed up"]
            }
    def _detect_sentiment(self, text):
        """Detect sentiment from text"""
        text_lower = text.lower()
        
        for sentiment, keywords in self.sentiment_map.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return sentiment
        
        # Default sentiment
        return "Neutral"
    
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        openapi_schema = get_openapi(
            title="Support Chat API",
            version="1.0.0",
            description="Multi-Agent Customer Support System API",
            routes=app.routes,
        )
        app.openapi_schema = openapi_schema
        return app.openapi_schema 
    
    app.openapi = custom_openapi
    
    def _detect_priority(self, text, sentiment):
        """Determine priority based on text and sentiment"""
        text_lower = text.lower()
        high_priority_words = ["critical", "urgent", "immediately", "broken", "failed", "error", "not working"]
        medium_priority_words = ["issue", "problem", "doesn't work", "help", "stuck"]
        
        # Critical priority for urgent words or urgent/frustrated sentiment
        if any(word in text_lower for word in high_priority_words) or sentiment in ["Urgent", "Frustrated", "Annoyed"]:
            return "High"
        # Medium priority for medium words or anxious/confused sentiment
        elif any(word in text_lower for word in medium_priority_words) or sentiment in ["Anxious", "Confused"]:
            return "Medium"
        # Default to low priority
        else:
            return "Low"
    
    def _categorize_issue(self, text):
        """Categorize the issue based on text"""
        text_lower = text.lower()
        
        # Define category keywords
        technical_keywords = ["install", "update", "error", "bug", "crash", "not working", "broken", "sync", "data", "connection"]
        billing_keywords = ["payment", "charge", "invoice", "bill", "refund", "subscription", "plan", "price"]
        account_keywords = ["account", "login", "password", "email", "profile", "settings", "access"]
        feature_keywords = ["feature", "add", "missing", "function", "capability", "can it do"]
        
        # Count matches for each category
        technical_count = sum(1 for word in technical_keywords if word in text_lower)
        billing_count = sum(1 for word in billing_keywords if word in text_lower)
        account_count = sum(1 for word in account_keywords if word in text_lower)
        feature_count = sum(1 for word in feature_keywords if word in text_lower)
        
        # Find the category with the most matches
        categories = {
            "Technical Support": technical_count,
            "Billing": billing_count,
            "Account": account_count,
            "Feature Request": feature_count
        }
        
        # Get the category with the highest count, default to General Support
        max_category = max(categories.items(), key=lambda x: x[1])
        if max_category[1] > 0:
            return max_category[0]
        else:
            return "General Support"
    
    def _estimate_resolution_time(self, category, priority):
        """Estimate resolution time based on category and priority"""
        # Base resolution times in minutes
        base_times = {
            "Technical Support": 60,
            "Billing": 30,
            "Account": 20,
            "Feature Request": 45,
            "General Support": 25
        }
        
        # Multipliers for priority
        priority_multipliers = {
            "High": 0.8,  # Faster response for high priority
            "Medium": 1.0,
            "Low": 1.2    # Slower response for low priority
        }
        
        base_time = base_times.get(category, 30)
        multiplier = priority_multipliers.get(priority, 1.0)
        
        return int(base_time * multiplier)
    
    def _extract_action_items(self, message, category):
        """Extract potential action items from message and category"""
        actions = []
        message_lower = message.lower()
        
        # Technical support actions
        if category == "Technical Support":
            if "install" in message_lower or "update" in message_lower:
                actions.append({
                    "action_type": "troubleshooting",
                    "description": "Check for antivirus interference during installation",
                    "priority": "Medium"
                })
                actions.append({
                    "action_type": "information",
                    "description": "Provide direct download link as alternative",
                    "priority": "Low"
                })
            
            if "sync" in message_lower or "not syncing" in message_lower:
                actions.append({
                    "action_type": "technical",
                    "description": "Reset sync token and instruct Force Full Sync",
                    "priority": "High"
                })
            
            if "crash" in message_lower or "error" in message_lower:
                actions.append({
                    "action_type": "troubleshooting",
                    "description": "Gather device and app version information",
                    "priority": "High"
                })
                actions.append({
                    "action_type": "technical",
                    "description": "Check logs for specific error codes",
                    "priority": "Medium"
                })
            
            if "connect" in message_lower or "connection" in message_lower:
                actions.append({
                    "action_type": "troubleshooting",
                    "description": "Verify network permissions and clear cache",
                    "priority": "Medium"
                })
        
        # Billing actions
        elif category == "Billing":
            actions.append({
                "action_type": "verification",
                "description": "Verify billing records and transaction history",
                "priority": "High"
            })
        
        # Account actions
        elif category == "Account":
            actions.append({
                "action_type": "security",
                "description": "Verify customer identity before making changes",
                "priority": "High"
            })
        
        # Feature Request actions
        elif category == "Feature Request":
            actions.append({
                "action_type": "documentation",
                "description": "Document feature request for product team",
                "priority": "Medium"
            })
        
        # If no specific actions detected, add a general action
        if not actions:
            actions.append({
                "action_type": "information",
                "description": "Gather additional details about the issue",
                "priority": "Medium"
            })
        
        return actions
    
    def _find_similar_issues(self, message, category):
        """Find similar issues in the database to generate better responses"""
        cursor = self.db_conn.cursor()
        
        # Look for knowledge base entries matching the category
        cursor.execute('''
        SELECT content FROM knowledge_base
        WHERE issue_category = ?
        ORDER BY RANDOM()
        LIMIT 1
        ''', (category,))
        
        kb_entry = cursor.fetchone()
        kb_content = kb_entry['content'] if kb_entry else ""
        
        # Look for similar conversations
        message_keywords = set(re.findall(r'\b\w+\b', message.lower()))
        
        # Get all conversations
        cursor.execute('SELECT conversation_id, transcript FROM conversation')
        conversations = cursor.fetchall()
        
        best_match = None
        best_match_score = 0
        
        for conv in conversations:
            conv_text = conv['transcript'].lower()
            conv_keywords = set(re.findall(r'\b\w+\b', conv_text))
            
            # Calculate simple overlap score
            overlap = len(message_keywords.intersection(conv_keywords))
            
            if overlap > best_match_score:
                best_match_score = overlap
                best_match = conv['conversation_id']
        
        similar_conversation = None
        if best_match:
            # Get conversation details
            cursor.execute('''
            SELECT c.conversation_id, c.category, c.sentiment, c.priority, s.content as summary
            FROM conversation c
            LEFT JOIN summary s ON c.conversation_id = s.conversation_id
            WHERE c.conversation_id = ?
            ''', (best_match,))
            
            similar_conversation = cursor.fetchone()
        
        return {
            "kb_content": kb_content,
            "similar_conversation": dict(similar_conversation) if similar_conversation else None
        }
    
    def _generate_response(self, message, category, sentiment, reference_data):
        """Generate response based on message analysis and reference data"""
        kb_content = reference_data.get("kb_content", "")
        similar_conversation = reference_data.get("similar_conversation")
        
        # Generic responses for each category
        generic_responses = {
            "Technical Support": [
                "I understand you're experiencing a technical issue. Let's troubleshoot this together.",
                "I'm sorry to hear you're having technical difficulties. I'll help you resolve this.",
                "Thanks for reporting this technical issue. Let me help you find a solution."
            ],
            "Billing": [
                "I understand your billing concern. Let me look into this for you.",
                "I'll help you with your billing question. Let me check the details.",
                "Thank you for bringing this billing matter to our attention. I'll assist you right away."
            ],
            "Account": [
                "I'll help you with your account. For security, I'll need to verify some information.",
                "I understand you need assistance with your account settings. I'm here to help.",
                "Thank you for reaching out about your account. Let's get this resolved for you."
            ],
            "Feature Request": [
                "Thank you for your feature suggestion! I'll document this for our product team.",
                "I appreciate your feedback about our product features. This helps us improve.",
                "Thanks for the feature idea! I'll make sure this gets to the right team."
            ],
            "General Support": [
                "Thank you for contacting support. I'm here to help you today.",
                "I'd be happy to assist you with your question. Could you provide more details?",
                "Thanks for reaching out. Let me help you with your request."
            ]
        }
        
        # Select a base response for the category
        base_response = random.choice(generic_responses.get(category, generic_responses["General Support"]))
        
        # Customize based on sentiment
        sentiment_additions = {
            "Frustrated": " I understand your frustration, and I'll do my best to resolve this quickly for you.",
            "Anxious": " I can understand your concern, and I'll help you through this step by step.",
            "Confused": " Let me clarify this for you. I'll explain the process in simple terms.",
            "Urgent": " I'll prioritize this issue and work on it right away.",
            "Annoyed": " I apologize for the inconvenience. Let's get this fixed as soon as possible."
        }
        
        sentiment_addition = sentiment_additions.get(sentiment, "")
        
        # Add knowledge base content if relevant
        kb_addition = ""
        if kb_content:
            # Extract the most relevant sentence from KB content
            kb_sentences = kb_content.split('.')
            if len(kb_sentences) > 1:
                kb_addition = f" Based on similar cases, {kb_sentences[0].strip()}."
            else:
                kb_addition = f" Based on similar cases, {kb_content.strip()}."
        
        # Add follow-up question based on category
        followup_questions = {
            "Technical Support": " Could you please provide more details about your device and software version?",
            "Billing": " Could you please confirm which payment or subscription you're inquiring about?",
            "Account": " For security purposes, could you verify the email address associated with your account?",
            "Feature Request": " Could you share more specific details about how this feature would help you?",
            "General Support": " Could you please provide more details about what you need help with today?"
        }
        
        followup = followup_questions.get(category, followup_questions["General Support"])
        
        # Combine all parts
        full_response = base_response + sentiment_addition + kb_addition + followup
        
        return full_response
    
    def _create_or_update_conversation(self, message, category, sentiment, priority):
        """Create a new conversation or update existing one"""
        cursor = self.db_conn.cursor()
        
        if not self.current_conversation_id:
            # Create a new conversation ID
            self.current_conversation_id = f"CHAT_{random.randint(1000, 9999)}"
            
            # Insert new conversation
            cursor.execute('''
            INSERT INTO conversation (
                conversation_id, category, sentiment, priority, transcript
            ) VALUES (?, ?, ?, ?, ?)
            ''', (
                self.current_conversation_id,
                category,
                sentiment,
                priority,
                f"Customer: {message}"
            ))
            
            # Create a ticket record
            ticket_id = f"T{self.current_conversation_id}"
            cursor.execute('''
            INSERT INTO ticket (
                ticket_id, issue_category, sentiment, priority, estimated_resolution_time
            ) VALUES (?, ?, ?, ?, ?)
            ''', (
                ticket_id,
                category,
                sentiment,
                priority,
                self._estimate_resolution_time(category, priority)
            ))
            
            # Update conversation with ticket ID
            cursor.execute('''
            UPDATE conversation
            SET ticket_id = ?
            WHERE conversation_id = ?
            ''', (ticket_id, self.current_conversation_id))
            
            # Insert message
            cursor.execute('''
            INSERT INTO message (
                conversation_id, sender_type, message_text
            ) VALUES (?, ?, ?)
            ''', (self.current_conversation_id, "customer", message))
            
            self.db_conn.commit()
        else:
            # Update existing conversation transcript
            cursor.execute('''
            SELECT transcript FROM conversation
            WHERE conversation_id = ?
            ''', (self.current_conversation_id,))
            
            current_transcript = cursor.fetchone()['transcript']
            updated_transcript = f"{current_transcript}\nCustomer: {message}"
            
            cursor.execute('''
            UPDATE conversation
            SET transcript = ?
            WHERE conversation_id = ?
            ''', (updated_transcript, self.current_conversation_id))
            
            # Insert message
            cursor.execute('''
            INSERT INTO message (
                conversation_id, sender_type, message_text
            ) VALUES (?, ?, ?)
            ''', (self.current_conversation_id, "customer", message))
            
            self.db_conn.commit()
        
        return self.current_conversation_id
    
    def _update_with_agent_response(self, conversation_id, response):
        """Update conversation with agent response"""
        cursor = self.db_conn.cursor()
        
        # Update transcript
        cursor.execute('''
        SELECT transcript FROM conversation
        WHERE conversation_id = ?
        ''', (conversation_id,))
        
        current_transcript = cursor.fetchone()['transcript']
        updated_transcript = f"{current_transcript}\nAgent: {response}"
        
        cursor.execute('''
        UPDATE conversation
        SET transcript = ?
        WHERE conversation_id = ?
        ''', (updated_transcript, conversation_id))
        
        # Insert message
        cursor.execute('''
        INSERT INTO message (
            conversation_id, sender_type, message_text
        ) VALUES (?, ?, ?)
        ''', (conversation_id, "agent", response))
        
        self.db_conn.commit()
    
    def _generate_summary(self, conversation_id, message, category):
        """Generate a summary for the conversation"""
        cursor = self.db_conn.cursor()
        
        # Get conversation transcript
        cursor.execute('''
        SELECT transcript FROM conversation
        WHERE conversation_id = ?
        ''', (conversation_id,))
        
        transcript = cursor.fetchone()['transcript']
        
        # Generate a summary based on the transcript and category
        if "sync" in message.lower() or "syncing" in message.lower():
            summary = "Customer experiencing sync issues between devices. Investigating possible corrupted sync token or account synchronization problems."
        elif "install" in message.lower() or "update" in message.lower():
            summary = "Customer unable to install or update software. Investigating possible conflicts with system security or third-party applications."
        elif "crash" in message.lower() or "error" in message.lower():
            summary = "Customer reporting application crashes or errors. Collecting device information and error logs to diagnose the issue."
        elif "connect" in message.lower() or "connection" in message.lower():
            summary = "Customer experiencing connection issues despite working internet. Investigating app permissions and cache-related problems."
        else:
            category_summaries = {
                "Technical Support": "Customer reporting technical issue that requires troubleshooting. Gathering system information to diagnose and resolve.",
                "Billing": "Customer has billing inquiry or issue with charges. Reviewing account information to address concerns.",
                "Account": "Customer needs assistance with account settings or access. Verifying identity before proceeding with changes.",
                "Feature Request": "Customer suggesting product enhancement or new feature. Documenting request for product team consideration."
            }
            summary = category_summaries.get(category, "Customer support inquiry requiring further information to properly categorize and address.")
        
        # Store the summary
        cursor.execute('''
        INSERT INTO summary (
            conversation_id, content, confidence_score
        ) VALUES (?, ?, ?)
        ''', (conversation_id, summary, 0.85))
        
        self.db_conn.commit()
        
        return summary
    
    def _store_action_items(self, conversation_id, actions):
        """Store action items in the database"""
        cursor = self.db_conn.cursor()
        
        for action in actions:
            cursor.execute('''
            INSERT INTO action_item (
                conversation_id, action_type, description, priority
            ) VALUES (?, ?, ?, ?)
            ''', (
                conversation_id,
                action["action_type"],
                action["description"],
                action["priority"]
            ))
        
        self.db_conn.commit()
    
    async def process_message(self, message: str) -> ConversationResponse:
        """Process a user message and generate a response with analysis"""
        # Analyze the message
        sentiment = self._detect_sentiment(message)
        category = self._categorize_issue(message)
        priority = self._detect_priority(message, sentiment)
        
        # Create or update conversation
        conversation_id = self._create_or_update_conversation(message, category, sentiment, priority)
        
        # Find similar issues for reference
        reference_data = self._find_similar_issues(message, category)
        
        # Extract potential action items
        actions = self._extract_action_items(message, category)
        
        # Store action items
        self._store_action_items(conversation_id, actions)
        
        # Generate response
        response = self._generate_response(message, category, sentiment, reference_data)
        
        # Update conversation with agent response
        self._update_with_agent_response(conversation_id, response)
        
        # Generate summary
        summary = self._generate_summary(conversation_id, message, category)
        
        # Estimate resolution time
        estimated_time = self._estimate_resolution_time(category, priority)
        
        # Simulate processing delay
        await asyncio.sleep(1)
        
        return ConversationResponse(
            message=response,
            action_items=actions,
            summary=summary,
            sentiment=sentiment,
            priority=priority,
            estimated_time=estimated_time,
            conversation_id=conversation_id
        )

# API routes
@app.post("/chat", response_model=ConversationResponse)
async def chat_message(message: Message = Body(...)):
    """Process a chat message and return a response"""
    try:
        agent = AIAgent()
        result = await agent.process_message(message.text)
        return result
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def get_conversation(conversation_id: str = Path(...)):
    """Get conversation details by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get conversation details
        cursor.execute('''
        SELECT c.*, s.content as summary
        FROM conversation c
        LEFT JOIN summary s ON c.conversation_id = s.conversation_id
        WHERE c.conversation_id = ?
        ''', (conversation_id,))
        
        conversation = cursor.fetchone()
        
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        # Get messages
        cursor.execute('''
        SELECT * FROM message
        WHERE conversation_id = ?
        ORDER BY timestamp ASC
        ''', (conversation_id,))
        
        messages = cursor.fetchall()
        
        # Get action items
        cursor.execute('''
        SELECT * FROM action_item
        WHERE conversation_id = ?
        ''', (conversation_id,))
        
        actions = cursor.fetchall()
        
        conn.close()
        
        return {
            "conversation": dict(conversation),
            "messages": [dict(m) for m in messages],
            "actions": [dict(a) for a in actions]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")

@app.get("/knowledge/{category}", response_model=List[Dict[str, Any]])
async def get_knowledge_base(category: str):
    """Get knowledge base entries for a category"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM knowledge_base
        WHERE issue_category = ?
        ''', (category,))
        
        entries = cursor.fetchall()
        conn.close()
        
        return [dict(entry) for entry in entries]
    except Exception as e:
        logger.error(f"Error retrieving knowledge base: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving knowledge base: {str(e)}")

# Run the server
if __name__ == "__main__": 
    import uvicorn
    uvicorn.run(app, host="0.0.0.0",port=8000)
