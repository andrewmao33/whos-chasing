import React from 'react';
import './Components.css';

function StartupPage({ onStartSelection }) {
  return (
    <div className="App">
      <div className="startup-container">
        <h1 className="main-title">Who's Chasing?</h1>
        <p className="subtitle">Analyze your iMessage conversations</p>
        <button 
          className="start-button"
          onClick={onStartSelection}
        >
          Start Selection
        </button>
      </div>
    </div>
  );
}

export default StartupPage; 