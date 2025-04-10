// Tickets.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Tickets.css';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    agent: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockTickets = [
        { id: 1, customer: "John Doe", subject: "Login Issues", status: "open", priority: "high", created: "2023-04-04T10:30:00", agent: "Alice Smith" },
        { id: 2, customer: "Jane Smith", subject: "Payment Failed", status: "in-progress", priority: "medium", created: "2023-04-03T14:45:00", agent: "Bob Johnson" },
        { id: 3, customer: "Robert Brown", subject: "Product Question", status: "open", priority: "low", created: "2023-04-03T09:15:00", agent: "Unassigned" },
        { id: 4, customer: "Sarah Wilson", subject: "Refund Request", status: "resolved", priority: "high", created: "2023-04-02T16:20:00", agent: "Charlie Davis" },
        { id: 5, customer: "Michael Clark", subject: "Account Locked", status: "open", priority: "high", created: "2023-04-04T08:10:00", agent: "Unassigned" },
        { id: 6, customer: "Emily Johnson", subject: "Feature Request", status: "in-progress", priority: "medium", created: "2023-04-01T11:15:00", agent: "Alice Smith" },
        { id: 7, customer: "David Lee", subject: "Subscription Issue", status: "open", priority: "high", created: "2023-04-04T09:20:00", agent: "Bob Johnson" },
        { id: 8, customer: "Jessica Taylor", subject: "Billing Question", status: "resolved", priority: "low", created: "2023-03-30T13:40:00", agent: "Charlie Davis" },
      ];
      
      setTickets(mockTickets);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      agent: 'all'
    });
    setSearchQuery('');
  };

  const applyFilters = () => {
    // In a real app, this would trigger an API call with the filters
    console.log('Applied filters:', filters);
  };

  const filteredTickets = tickets.filter(ticket => {
    // Apply status filter
    if (filters.status !== 'all' && ticket.status !== filters.status) {
      return false;
    }
    
    // Apply priority filter
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) {
      return false;
    }
    
    // Apply agent filter
    if (filters.agent !== 'all' && ticket.agent !== filters.agent) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(query) ||
        ticket.customer.toLowerCase().includes(query) ||
        `#${ticket.id}`.includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1 className="tickets-title">Tickets</h1>
        <p className="tickets-subtitle">Manage and view all support tickets</p>
      </div>
      
      <div className="filters-container">
        <h2 className="filters-title">Filter Tickets</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              name="status"
              className="filter-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select
              name="priority"
              className="filter-select"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Agent</label>
            <select
              name="agent"
              className="filter-select"
              value={filters.agent}
              onChange={handleFilterChange}
            >
              <option value="all">All Agents</option>
              <option value="Alice Smith">Alice Smith</option>
              <option value="Bob Johnson">Bob Johnson</option>
              <option value="Charlie Davis">Charlie Davis</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
        
        <div className="filters-actions">
          <button className="filter-button filter-reset" onClick={resetFilters}>
            Reset Filters
          </button>
          <button className="filter-button filter-apply" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
      
      <div className="tickets-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search tickets by ID, customer, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-button">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>
      
      <div className="tickets-table-container">
        <div className="table-header">
          <h2 className="table-title">All Tickets</h2>
          <Link to="/create-ticket" className="create-ticket-button">
            <svg className="create-ticket-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Ticket
          </Link>
        </div>
        
        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No tickets found matching your criteria.</p>
          </div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.customer}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{new Date(ticket.created).toLocaleString()}</td>
                  <td>{ticket.agent}</td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="view-button">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="pagination">
          <div className="pagination-info">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
          <div className="pagination-actions">
            <button className="pagination-button">Previous</button>
            <button className="pagination-button active">1</button>
            <button className="pagination-button">2</button>
            <button className="pagination-button">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tickets;