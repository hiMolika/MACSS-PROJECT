<<<<<<< HEAD
// App.js - Layout structure
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Tickets from './components/Tickets';
import TicketDetail from './components/TicketDetail';
import CreateTicket from './components/CreateTicket';
import Agents from './components/Agents';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // Check if this is the first visit in this session
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}
      
      <BrowserRouter>
        <div className={`flex h-screen ${showWelcome ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
          {/* Fixed sidebar */}
          <aside className="fixed inset-y-0 left-0 z-20 w-64">
            <Sidebar />
          </aside>
          
          {/* Main content */}
          <div className="flex-1 ml-64 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-100">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/agents" element={<Agents />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
=======
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
>>>>>>> 4086aeb2656761c8efbb86d68dee50fb9d59000a
