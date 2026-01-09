import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // 사용자 메시지 추가
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        tokens: response.data.tokens_used
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.detail || '메시지 전송 중 오류가 발생했습니다.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>🤖 LLM AI Chat</h1>
          <button onClick={clearChat} className="clear-btn">채팅 지우기</button>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>안녕하세요! AI 어시스턴트입니다. 무엇을 도와드릴까요?</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                <div className="message-role">
                  {msg.role === 'user' ? '👤 사용자' : '🤖 AI'}
                </div>
                <div className={`message-text ${msg.error ? 'error' : ''}`}>
                  {msg.content}
                </div>
                {msg.tokens && (
                  <div className="message-meta">
                    토큰 사용량: {msg.tokens}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="message-role">🤖 AI</div>
                <div className="message-text loading">
                  <span className="typing-indicator">●</span>
                  <span className="typing-indicator">●</span>
                  <span className="typing-indicator">●</span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            rows={3}
            disabled={loading}
            className="message-input"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="send-button"
          >
            {loading ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
