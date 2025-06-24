import React from 'react';
import './Components.css';

function AnalysisPage({ selectedContact, onBackToContacts }) {
  const contactName = selectedContact[1] && selectedContact[2] 
    ? `${selectedContact[1]} ${selectedContact[2]}` 
    : selectedContact[1] || selectedContact[2] || 'Unknown Contact';

  return (
    <div className="App">
      <div className="conversation-container">
        <button className="back-button" onClick={onBackToContacts}>
          ← Back to Contacts
        </button>
        
        <div className="conversation-header">
          <h1>{contactName}</h1>
          <p className="phone-number">{selectedContact[0]}</p>
        </div>

        <div className="analysis-content">
          <p>Analysis page for {contactName}</p>
          <p>Phone: {selectedContact[0]}</p>
          <p>This is where the conversation analysis will go.</p>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage; 