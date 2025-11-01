import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';

const ChatModal = ({ bookingId, onClose, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const endpoint = userRole === 'customer' 
        ? `/customer/booking/${bookingId}/messages`
        : `/technician/job/${bookingId}/messages`;
      const response = await api.get(endpoint);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId, userRole]);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    pollingInterval.current = setInterval(loadMessages, 3000);
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const endpoint = userRole === 'customer'
        ? `/customer/booking/${bookingId}/message`
        : `/technician/job/${bookingId}/message`;
      
      await api.post(endpoint, { message: newMessage.trim() });
      setNewMessage('');
      loadMessages(); // Reload messages immediately
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div 
      className="modal" 
      style={{ display: 'flex', zIndex: 10000 }} 
      onClick={onClose}
    >
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '900px', 
          width: '92%',
          maxHeight: '85vh',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 0.3s ease-out'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderBottom: '2px solid var(--card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>💬 Chat</h2>
          <span 
            className="close" 
            onClick={onClose}
            style={{ fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </span>
        </div>

        {/* Messages Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '2rem',
          background: 'var(--progress-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.sender === userRole;
              return (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '0.75rem 1.25rem',
                    borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: isOwnMessage 
                      ? 'var(--accent-gradient)' 
                      : 'var(--card-bg)',
                    color: isOwnMessage ? 'white' : 'var(--text-primary)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
                  }}>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      marginBottom: '0.3rem',
                      opacity: 0.85,
                      fontWeight: 600
                    }}>
                      {msg.senderName}
                    </div>
                    <p style={{ margin: 0, wordBreak: 'break-word', lineHeight: '1.4', fontSize: '1rem' }}>{msg.message}</p>
                    <div style={{ 
                      fontSize: '0.65rem', 
                      marginTop: '0.3rem',
                      opacity: 0.75,
                      textAlign: 'right'
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form 
          onSubmit={handleSendMessage}
          style={{ 
            padding: '2rem', 
            borderTop: '2px solid var(--card-border)'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              style={{
                width: '100%',
                padding: '1.2rem 5rem 1.2rem 1.75rem',
                borderRadius: '30px',
                border: '2px solid var(--card-border)',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
            />
            <button 
              type="submit"
              className="btn"
              disabled={!newMessage.trim() || sending}
              style={{
                position: 'absolute',
                right: '8px',
                padding: '0.75rem',
                borderRadius: '50%',
                width: '52px',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                border: 'none',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                opacity: newMessage.trim() ? 1 : 0.5
              }}
            >
              {sending ? '⏳' : '➤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
