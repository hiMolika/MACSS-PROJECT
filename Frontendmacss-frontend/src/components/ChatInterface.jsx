// ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

function ChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "agent", timestamp: new Date().toISOString() },
    { id: 2, text: "My app is crashing!", sender: "user", timestamp: new Date().toISOString() },
    { id: 3, text: "I've checked our records and found the issue. We're working on a solution.", sender: "agent", timestamp: new Date().toISOString() },
    { id: 4, text: "Could you please provide more information about the issue you're experiencing?", sender: "agent", timestamp: new Date().toISOString() }
  ]);
  
  const [ticketInfo, setTicketInfo] = useState({
    id: "TK-1234",
    status: "open",
    subject: "Login Issues",
    priority: "medium",
    customer: "John Doe",
    created: new Date().toISOString()
  });
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "I understand your concern. Let me check that for you.",
        "Thanks for providing those details. I'll look into this issue right away.",
        "I can definitely help you with that. Could you provide more information?",
        "I'll need a bit more information to properly assist you with this issue."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'agent',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="user-info">
              <div className="user-avatar">
                {ticketInfo.customer.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="user-details">
                <h2 className="user-name">{ticketInfo.customer}</h2>
                <p className="ticket-id">Ticket #{ticketInfo.id}</p>
              </div>
            </div>
            <span className={`status-indicator status-${ticketInfo.status}`}>
              {ticketInfo.status}
            </span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`message ${msg.sender === 'user' ? 'user-message' : ''}`}
            >
              {msg.sender === 'agent' && (
                <div className="message-avatar agent-avatar">
                  A
                </div>
              )}
              <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'agent-bubble'}`}>
                <p>{msg.text}</p>
                <div className={`message-time ${msg.sender === 'user' ? 'user-time' : 'agent-time'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="message-avatar user-avatar">
                  U
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-container">
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button
              className="send-button"
              onClick={sendMessage}
            >
              <svg className="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="ticket-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Ticket Details</h2>
        </div>
        <div className="sidebar-content">
          <div className="detail-section">
            <h3 className="detail-label">Subject</h3>
            <p className="detail-value">{ticketInfo.subject}</p>
          </div>
          
          <div className="detail-section">
            <h3 className="detail-label">Status</h3>
            <span className={`status-badge status-${ticketInfo.status}`}>
              {ticketInfo.status}
            </span>
          </div>
          
          <div className="detail-section">
            <h3 className="detail-label">Priority</h3>
            <span className={`priority-badge priority-${ticketInfo.priority}`}>
              {ticketInfo.priority}
            </span>
          </div>
          
          <div className="detail-section">
            <h3 className="detail-label">Created</h3>
            <p className="detail-value">{new Date(ticketInfo.created).toLocaleString()}</p>
          </div>
          
          <div className="quick-responses">
            <h3 className="responses-label">Quick Responses</h3>
            <button 
              className="response-button"
              onClick={() => setMessage("Thank you for your patience. I'm working on resolving your issue.")}
            >
              Thank you for your patience...
            </button>
            <button 
              className="response-button"
              onClick={() => setMessage("Could you please provide more information about the issue you're experiencing?")}
            >
              Ask for more information...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;