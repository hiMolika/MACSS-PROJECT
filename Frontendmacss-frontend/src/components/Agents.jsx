// Agents.jsx
import React, { useState, useEffect } from 'react';
import './Agents.css';

function Agents() {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockAgents = [
                { id: 1, name: "Alice Smith", email: "alice@example.com", role: "Senior Support Agent", status: "available", performance: 92 },
                { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "Support Agent", status: "busy", performance: 85 },
                { id: 3, name: "Charlie Davis", email: "charlie@example.com", role: "Junior Support Agent", status: "away", performance: 78 },
                { id: 4, name: "Diana Edwards", email: "diana@example.com", role: "Support Lead", status: "available", performance: 96 },
                { id: 5, name: "Ethan Flores", email: "ethan@example.com", role: "Support Agent", status: "offline", performance: 81 },
            ];
            setAgents(mockAgents);
            setIsLoading(false);
        }, 500);
    }, []);

    const filteredAgents = filter === 'all' 
        ? agents 
        : agents.filter(agent => agent.status === filter);

    return (
        <div className="agents-container">
            <div className="agents-header">
                <h1 className="agents-title">Agent Management</h1>
                <p className="agents-subtitle">View and manage your support team</p>
            </div>
            
            <div className="filters-container">
                <button 
                    className={`filter-button ${filter === 'all' ? 'filter-all' : 'filter-inactive'}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={`filter-button ${filter === 'available' ? 'filter-available' : 'filter-inactive'}`}
                    onClick={() => setFilter('available')}
                >
                    Available
                </button>
                <button 
                    className={`filter-button ${filter === 'busy' ? 'filter-busy' : 'filter-inactive'}`}
                    onClick={() => setFilter('busy')}
                >
                    Busy
                </button>
                <button 
                    className={`filter-button ${filter === 'away' ? 'filter-away' : 'filter-inactive'}`}
                    onClick={() => setFilter('away')}
                >
                    Away
                </button>
            </div>
            
            {isLoading ? (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="agents-grid">
                    {filteredAgents.map(agent => (
                        <div key={agent.id} className="agent-card" onClick={() => setSelectedAgent(agent)}>
                            <div className="agent-header">
                                <div className="agent-info">
                                    <div className={`agent-avatar avatar-${agent.status}`}>
                                        {agent.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="agent-details">
                                        <h3 className="agent-name">{agent.name}</h3>
                                        <p className="agent-role">{agent.role}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="agent-content">
                                <div className="agent-contact">
                                    <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    {agent.email}
                                </div>
                                <div className="performance-container">
                                    <p className="performance-label">Performance</p>
                                    <div className="progress-bar">
                                        <div className="progress-value" style={{ width: `${agent.performance}%` }}></div>
                                    </div>
                                    <p className="progress-text">{agent.performance}%</p>
                                </div>
                                <div className="agent-footer">
                                    <span className={`status-badge status-${agent.status}`}>
                                        {agent.status}
                                    </span>
                                    <button className="view-details-button">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {selectedAgent && (
                <div className="agent-details-panel">
                    <div className="agent-details-header">
                        <h2 className="agent-details-title">Agent Details</h2>
                    </div>
                    <div className="agent-profile">
                        <div className={`agent-large-avatar avatar-${selectedAgent.status}`}>
                            {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h3 className="agent-profile-name">{selectedAgent.name}</h3>
                        <p className="agent-profile-role">{selectedAgent.role}</p>
                        <span className={`status-badge status-${selectedAgent.status} agent-status-badge`}>
                            {selectedAgent.status}
                        </span>
                    </div>
                    <div className="agent-metrics">
                        <h3 className="metrics-title">Performance Metrics</h3>
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <p className="metric-label">Performance</p>
                                <p className="metric-value">{selectedAgent.performance}%</p>
                            </div>
                            <div className="metric-card">
                                <p className="metric-label">Tickets Handled</p>
                                <p className="metric-value">124</p>
                            </div>
                            <div className="metric-card">
                                <p className="metric-label">Avg Response Time</p>
                                <p className="metric-value">28m</p>
                            </div>
                            <div className="metric-card">
                                <p className="metric-label">Satisfaction</p>
                                <p className="metric-value">4.8/5</p>
                            </div>
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button className="primary-action">Message</button>
                        <button className="secondary-action">Edit Profile</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Agents;