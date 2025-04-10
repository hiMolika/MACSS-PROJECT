// TicketDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './TicketDetail.css';

function TicketDetail() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState('');
  
    useEffect(() => {
        // Simulate API call to fetch ticket details
        setTimeout(() => {
            const mockTicket = {
                id: id,
                subject: "Login Issues with Account",
                status: "open",
                priority: "high",
                category: "Technical Support",
                created: "2023-04-04T10:30:00",
                updated: "2023-04-05T09:15:00",
                customer: {
                    name: "John Doe",
                    email: "john.doe@example.com"
                },
                assignedTo: "Alice Smith",
                attachments: [
                    { name: "screenshot.png", size: "2.4 MB", type: "image/png" },
                    { name: "error_log.txt", size: "1.1 KB", type: "text/plain" }
                ]
            };
            
            const mockMessages = [
                {
                    id: 1,
                    type: "user",
                    sender: "John Doe",
                    content: "I'm having trouble logging into my account. Every time I enter my password, it says 'Invalid credentials'.",
                    timestamp: "2023-04-04T10:30:00"
                },
                {
                    id: 2,
                    type: "system",
                    content: "Ticket created and assigned to Alice Smith",
                    timestamp: "2023-04-04T10:31:00"
                },
                {
                    id: 3,
                    type: "agent",
                    sender: "Alice Smith",
                    content: "Hi John, I'm sorry you're experiencing this issue. Can you tell me when this started happening? Have you tried resetting your password?",
                    timestamp: "2023-04-04T10:45:00"
                },
                {
                    id: 4,
                    type: "user",
                    sender: "John Doe",
                    content: "It started yesterday. I tried resetting my password but I'm not receiving the reset email.",
                    timestamp: "2023-04-04T11:02:00"
                },
                {
                    id: 5,
                    type: "agent",
                    sender: "Alice Smith",
                    content: "Thank you for that information. Let me check if there's any issue with the email delivery system. I'll also verify your account status.",
                    timestamp: "2023-04-04T11:15:00"
                },
                {
                    id: 6,
                    type: "agent",
                    sender: "Alice Smith",
                    content: "I've checked our systems and there appears to be a delay in our email delivery. The team is working on resolving this. In the meantime, I can help you reset your password manually. Would you like me to do that?",
                    timestamp: "2023-04-05T09:15:00"
                }
            ];
            
            setTicket(mockTicket);
            setMessages(mockMessages);
            setIsLoading(false);
        }, 700);
    }, [id]);

    const handleStatusChange = (newStatus) => {
        setTicket(prev => ({
            ...prev,
            status: newStatus
        }));
    };

    const handleReplySubmit = (e) => {
        e.preventDefault();
        
        if (!reply.trim()) return;
        
        const newMessage = {
            id: Date.now(),
            type: "agent",
            sender: "Alice Smith",
            content: reply,
            timestamp: new Date().toISOString()
        };
        
        setMessages([...messages, newMessage]);
        setReply('');
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatMessageDate = (dateString) => {
        const today = new Date();
        const messageDate = new Date(dateString);
        
        // Check if the message is from today
        if (messageDate.toDateString() === today.toDateString()) {
            return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Check if the message is from yesterday
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Otherwise, show the full date
        return formatDate(dateString);
    };

    if (isLoading) {
        return (
            <div className="ticket-detail-container">
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="ticket-detail-container">
            <Link to="/tickets" className="back-button">
                <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Tickets
            </Link>
            
            <div className="ticket-header">
                <h1 className="ticket-title">#{ticket.id}: {ticket.subject}</h1>
                <div className="ticket-meta">
                    <div className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">{formatDate(ticket.created)}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Updated:</span>
                        <span className="meta-value">{formatDate(ticket.updated)}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Status:</span>
                        <span className={`status-badge status-${ticket.status}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Priority:</span>
                        <span className={`priority-${ticket.priority}`}>
                            {ticket.priority}
                        </span>
                    </div>
                </div>
                <div className="ticket-actions">
                    <button className="action-button action-secondary">
                        Assign
                    </button>
                    <button className="action-button action-primary">
                        Resolve
                    </button>
                    <button className="action-button action-danger">
                        Close
                    </button>
                </div>
            </div>
            
            <div className="ticket-body">
                <div className="conversation-panel">
                    <div className="conversation-header">
                        <h2 className="conversation-title">Conversation</h2>
                    </div>
                    
                    <div className="messages-container">
                        {messages.map((message, index) => {
                            // Check if we should display a date separator
                            const showDateSeparator = index === 0 || (
                                new Date(message.timestamp).toDateString() !== 
                                new Date(messages[index - 1].timestamp).toDateString()
                            );
                            
                            return (
                                <React.Fragment key={message.id}>
                                    {showDateSeparator && (
                                        <div className="message-timestamp">
                                            <span className="timestamp-text">
                                                {new Date(message.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className={`${message.type}-message`}>
                                        <div className="message-content">
                                            {message.type !== 'user' && (
                                                <div className="avatar">
                                                    {message.type === 'agent' ? 'A' : 'S'}
                                                </div>
                                            )}
                                            <div className="message-bubble">
                                                <div className="message-text">{message.content}</div>
                                                <div className="message-time">
                                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {message.type === 'user' && (
                                                <div className="avatar">
                                                    {message.sender.split(' ')[0][0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    
                    <form className="reply-box" onSubmit={handleReplySubmit}>
                        <textarea
                            className="reply-input"
                            placeholder="Type your reply here..."
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                        ></textarea>
                        <div className="reply-actions">
                            <div className="reply-tools">
                                <button type="button" className="tool-button">
                                    <svg className="tool-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                    </svg>
                                </button>
                                <button type="button" className="tool-button">
                                    <svg className="tool-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </button>
                            </div>
                            <button type="submit" className="reply-submit">Send Reply</button>
                        </div>
                    </form>
                </div>
                
                <div className="ticket-sidebar">
                    <div className="sidebar-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Ticket Status</h2>
                        </div>
                        <div className="panel-content">
                            <div className="ticket-status">
                                <span className="detail-label">Current Status</span>
                                <div className="status-selector">
                                    <div 
                                        className={`status-option status-open ${ticket.status === 'open' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('open')}
                                    >
                                        Open
                                    </div>
                                    <div 
                                        className={`status-option status-in-progress ${ticket.status === 'in-progress' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('in-progress')}
                                    >
                                        In Progress
                                    </div>
                                    <div 
                                        className={`status-option status-resolved ${ticket.status === 'resolved' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('resolved')}
                                    >
                                        Resolved
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="sidebar-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Customer Information</h2>
                        </div>
                        <div className="panel-content">
                            <div className="customer-info">
                                <div className="customer-avatar">
                                    {ticket.customer.name.split(' ')[0][0]}
                                </div>
                                <div className="customer-details">
                                    <h3 className="customer-name">{ticket.customer.name}</h3>
                                    <p className="customer-email">{ticket.customer.email}</p>
                                </div>
                            </div>
                            
                            <div className="detail-item">
                                <span className="detail-label">Category</span>
                                <div className="detail-value">{ticket.category}</div>
                            </div>
                            
                            <div className="detail-item">
                                <span className="detail-label">Assigned To</span>
                                <div className="detail-value">{ticket.assignedTo}</div>
                            </div>
                        </div>
                    </div>
                    
                    {ticket.attachments.length > 0 && (
                        <div className="sidebar-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Attachments</h2>
                            </div>
                            <div className="panel-content">
                                <div className="attachments">
                                    {ticket.attachments.map((attachment, index) => (
                                        <div key={index} className="attachment">
                                            <svg className="attachment-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            <span className="attachment-name">{attachment.name}</span>
                                            <span className="attachment-download">Download</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TicketDetail;