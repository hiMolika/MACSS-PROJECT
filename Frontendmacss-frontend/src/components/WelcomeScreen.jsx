// src/components/WelcomeScreen.jsx
import React, { useState } from 'react';
import './WelcomeScreen.css'; // Import the CSS file

function WelcomeScreen({ onComplete }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onComplete(); // Call the onComplete function to navigate to the next page
    }, 1000); // Match this duration with the CSS animation duration
  };

  return (
    <div 
      className={`welcome-screen ${isAnimating ? 'fade-out' : ''}`}
      onClick={handleClick}
    >
      <div className="welcome-content">
        <div className="background-circle circle-1"></div>
        <div className="background-circle circle-2"></div>
        <div className="background-circle circle-3"></div>
        <div className="symbol">🤖</div> {/* Using a robot emoji as a symbol */}
        <h1 className="welcome-title">WELCOME TO</h1>
        <h2 className="welcome-subtitle">MACSS</h2>
        <div className="welcome-prompt">
          <p>Tap anywhere to continue</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;