import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        } else {
          setError('Failed to fetch contacts from backend');
        }
      } catch (err) {
        setError(`Connection error: ${err.message}. Make sure the backend is running on http://localhost:8000`);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactClick = async (contact) => {
    try {
      setLoading(true);
      setError(null);
      
      const phoneNumber = contact[0];
      const url = `http://localhost:8000/conversation/${encodeURIComponent(phoneNumber)}`;
      console.log('Making request to:', url);
      console.log('Phone number:', phoneNumber);
      console.log('Encoded phone number:', encodeURIComponent(phoneNumber));
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setSelectedContact(contact);
          // You can store the conversation data here if needed
          console.log('Conversation data:', data);
        }
      } else {
        setError('Failed to fetch conversation data');
      }
    } catch (err) {
      setError(`Error fetching conversation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
  };

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

  // Show analysis page
  if (selectedContact) {
    const contactName = selectedContact[1] && selectedContact[2] 
      ? `${selectedContact[1]} ${selectedContact[2]}` 
      : selectedContact[1] || selectedContact[2] || 'Unknown Contact';

    return (
      <div className="App">
        <div className="conversation-container">
          <button className="back-button" onClick={handleBackToContacts}>
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

  // Show contacts list
  return (
    <div className="App">
      <div className="contacts-container">
        <h1>Contacts</h1>
        <div className="contacts-list">
          {contacts.length === 0 ? (
            <p>No contacts found</p>
          ) : (
            contacts.map((contact, index) => (
              <div 
                key={index} 
                className="contact-card"
                onClick={() => handleContactClick(contact)}
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

export default App;
