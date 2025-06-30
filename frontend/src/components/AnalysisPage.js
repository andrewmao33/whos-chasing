import React from 'react';
import './Components.css';

function AnalysisPage({ selectedContact, conversationData, onBackToContacts }) {
  const contactName = selectedContact[1] && selectedContact[2] 
    ? `${selectedContact[1]} ${selectedContact[2]}` 
    : selectedContact[1] || selectedContact[2] || 'Unknown Contact';

  if (!conversationData) {
    return (
      <div className="App">
        <div className="conversation-container">
          <button className="back-button" onClick={onBackToContacts}>
            ← Back to Contacts
          </button>
        </div>
      </div>
    );
  }

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

        <div className="messages-section">
          <h3>Message count analysis</h3>
          <div className="message-count-analysis">
            <p><strong>Total messages:</strong> {conversationData.sent + conversationData.received}</p>
            <p><strong>Messages sent:</strong> {conversationData.sent}</p>
            <p><strong>Messages received:</strong> {conversationData.received}</p>
          </div>
        </div>

        <div className="messages-section">
          <h3>Response time analysis</h3>
          <div className="message-count-analysis">
            <p><strong>My mean response time:</strong> {conversationData.my_mean}</p>
            <p><strong>My median response time:</strong> {conversationData.my_median}</p>
            <p><strong>My max response time:</strong> {conversationData.my_max}</p>
            <p><strong>My slowest reply:</strong> {conversationData.my_slowest_reply}</p>
            <p><strong>Their mean response time:</strong> {conversationData.their_mean}</p>
            <p><strong>Their median response time:</strong> {conversationData.their_median}</p>
            <p><strong>Their max response time:</strong> {conversationData.their_max}</p>
            <p><strong>Their slowest reply:</strong> {conversationData.their_slowest_reply}</p>
          </div>
        </div>

        <div className="messages-section">
          <h3>One text responses</h3>
          <div className="message-count-analysis">
              <p><strong>My one text responses:</strong> {conversationData.my_one_text_responses}</p>
              <p><strong>Their one text responses:</strong> {conversationData.their_one_text_responses}</p>
              <p><strong>My one word responses:</strong> {conversationData.my_one_word_responses}</p>
              <p><strong>Their one word responses:</strong> {conversationData.their_one_word_responses}</p>
          </div>
        </div>

        
        {/* Raw Data for Debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-section">
            <h3>Debug Info</h3>
            <pre className="debug-data">
              {JSON.stringify(conversationData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysisPage; 