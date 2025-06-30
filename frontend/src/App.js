import React, { useState, useEffect } from 'react';
import './App.css';
import StartupPage from './components/StartupPage';
import ContactsPage from './components/ContactsPage';
import AnalysisPage from './components/AnalysisPage';

function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversationData, setConversationData] = useState(null);
  const [currentPage, setCurrentPage] = useState('startup'); // 'startup', 'contacts', 'analysis'

  useEffect(() => {
    // Only fetch contacts when we navigate to contacts page
    if (currentPage === 'contacts') {
      fetchContacts();
    }
  }, [currentPage]);

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

  const handleStartSelection = () => {
    setCurrentPage('contacts');
  };

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
          setConversationData(data);
          setCurrentPage('analysis');
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
    setConversationData(null);
    setCurrentPage('contacts');
  };

  const handleBackToStart = () => {
    setSelectedContact(null);
    setConversationData(null);
    setCurrentPage('startup');
  };

  // Render the appropriate page based on current state
  switch (currentPage) {
    case 'startup':
      return <StartupPage onStartSelection={handleStartSelection} />;
    
    case 'contacts':
      return (
        <ContactsPage
          contacts={contacts}
          loading={loading}
          error={error}
          onContactClick={handleContactClick}
          onBackToStart={handleBackToStart}
        />
      );
    
    case 'analysis':
      return (
        <AnalysisPage
          selectedContact={selectedContact}
          conversationData={conversationData}
          onBackToContacts={handleBackToContacts}
        />
      );
    
    default:
      return null;
  }
}

export default App;
