import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const tickets = [
        { id: '1', customer: 'John Doe', subject: 'Login Issues', status: 'open', priority: 'high', agent: 'Alice Smith' },
        { id: '2', customer: 'Jane Smith', subject: 'Payment Failed', status: 'in-progress', priority: 'medium', agent: 'Bob Johnson' },
        { id: '3', customer: 'Robert Brown', subject: 'Product Question', status: 'open', priority: 'low', agent: 'Unassigned' },
        { id: '4', customer: 'Sarah Wilson', subject: 'Refund Request', status: 'resolved', priority: 'high', agent: 'Charlie Davis' },
    ];

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>Support Hub</h1>
                <p>Multi-Agent Customer Support Admin Panel</p>
                <div className="user-info">
                    <span>ADAdmin</span>
                    <span>admin@support.com</span>
                </div>
            </header>
            <nav className="sidebar">
                <ul>
                    <li>Dashboard</li>
                    <li>Tickets</li>
                    <li>Chat</li>
                </ul>
            </nav>
            <main className="main-content">
                <h2>Dashboard</h2>
                <p>Welcome back! Here’s what’s happening with your support system.</p>
                <div className="ticket-summary">
                    <div className="summary-item open"> 📁 Open: 3</div>
                    <div className="summary-item in-progress"> 🔄 In Progress: 1</div>
                    <div className="summary-item resolved"> ✅ Resolved: 1</div>
                    <div className="summary-item total"> 📊 Total Tickets: 5</div>
                </div>
                <table className="ticket-table">
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Customer</td>
                            <td>Subject</td>
                            <td>Status</td>
                            <td>Priority</td>
                            <td>Agent</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.customer}</td>
                                <td>{ticket.subject}</td>
                                <td className={ticket.status}>{ticket.status}</td>
                                <td>{ticket.priority}</td>
                                <td>{ticket.agent}</td>
                                <td><button className="view-button">View</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default Dashboard;