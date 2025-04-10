// Header.jsx
import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">Multi-Agent Customer Support</h1>
        <span className="header-badge">Admin Panel</span>
      </div>
      
      <div className="header-actions">
        <div className="search-bar">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
          />
        </div>
        
        <button className="notification-button">
          <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span className="notification-badge"></span>
        </button>
        
        <div className="profile">
          <div className="profile-info">
            <div className="profile-name">Admin</div>
            <div className="profile-email">admin@support.com</div>
          </div>
          <div className="profile-avatar">AD</div>
        </div>
      </div>
    </header>
  );
}

export default Header;