import React from 'react';
import './Components.css';

function ContactsPage({ 
  contacts, 
  loading, 
  error, 
  onContactClick, 
  onBackToStart 
}) {
  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <h2>Loading contacts...</h2>
          <div className="loading-spinner">🔄</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error-screen">
          <h2>❌ Error</h2>
          <div className="error-message">
            <pre>{error}</pre>
          </div>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="contacts-container">
        <button className="back-button" onClick={onBackToStart}>
          ← Back to Start
        </button>
        
        <h1>Contacts</h1>
        <div className="contacts-list">
          {contacts.length === 0 ? (
            <p>No contacts found</p>
          ) : (
            contacts.map((contact, index) => (
              <div 
                key={index} 
                className="contact-card"
                onClick={() => onContactClick(contact)}
              >
                <div className="contact-info">
                  <h3>
                    {contact[1] && contact[2] 
                      ? `${contact[1]} ${contact[2]}` 
                      : contact[1] || contact[2] || 'Unknown Name'
                    }
                  </h3>
                  <p className="phone-number">{contact[0] || 'No phone number'}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="footer">
          <p>Total contacts: {contacts.length}</p>
          <p>Click on a contact to analyze your conversation</p>
        </div>
      </div>
    </div>
  );
}

export default ContactsPage; 