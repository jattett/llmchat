'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import styles from './page.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Message {
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  error?: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    
    // 사용자 메시지 추가
    const newUserMessage: Message = { role: 'user', content: userMessage }
    setMessages(prev => [...prev, newUserMessage])
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        tokens: response.data.tokens_used
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.response?.data?.detail || '메시지 전송 중 오류가 발생했습니다.')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다.',
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className={styles.app}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h1>🤖 LLM AI Chat</h1>
          <button onClick={clearChat} className={styles.clearBtn}>채팅 지우기</button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 && (
            <div className={styles.welcomeMessage}>
              <p>안녕하세요! AI 어시스턴트입니다. 무엇을 도와드릴까요?</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
              <div className={styles.messageContent}>
                <div className={styles.messageRole}>
                  {msg.role === 'user' ? '👤 사용자' : '🤖 AI'}
                </div>
                <div className={`${styles.messageText} ${msg.error ? styles.error : ''}`}>
                  {msg.content}
                </div>
                {msg.tokens && (
                  <div className={styles.messageMeta}>
                    토큰 사용량: {msg.tokens}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageContent}>
                <div className={styles.messageRole}>🤖 AI</div>
                <div className={`${styles.messageText} ${styles.loading}`}>
                  <span className={styles.typingIndicator}>●</span>
                  <span className={styles.typingIndicator}>●</span>
                  <span className={styles.typingIndicator}>●</span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            rows={3}
            disabled={loading}
            className={styles.messageInput}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={styles.sendButton}
          >
            {loading ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  )
}
