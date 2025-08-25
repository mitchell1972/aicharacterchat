import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Character, ChatMessage } from '../lib/supabase'
import { DataService } from '../services/dataService'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Send, User, Bot, TestTube, Loader2, QrCode } from 'lucide-react'
import { formatTime } from '../lib/utils'

interface ChatPageProps {
  onViewQR?: () => void
}

export default function ChatPage({ onViewQR }: ChatPageProps) {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  const { user, isDemoMode } = useAuth()
  const [character, setCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (characterId) {
      loadChatData()
    }
  }, [characterId, user, isDemoMode])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatData = async () => {
    if (!characterId || !user) return

    setLoading(true)
    try {
      const dataService = DataService.getInstance()
      const char = await dataService.getCharacterById(characterId)
      setCharacter(char)
      
      if (char) {
        const msgs = await dataService.getChatMessages(user.id, characterId)
        setMessages(msgs)
      }
    } catch (error) {
      console.error('Error loading chat data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !character || !user || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const dataService = DataService.getInstance()
      const result = await dataService.sendMessage(user.id, character.id, messageText)
      
      if (result) {
        setMessages(prev => [...prev, result.userMessage, result.aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mx-auto animate-pulse"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Character not found</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-cyan-400 text-white font-semibold">
                    {character.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-800">{character.name}</h1>
                  <p className="text-sm text-gray-500">AI Character</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isDemoMode && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <TestTube className="w-3 h-3 mr-1" />
                  Demo
                </Badge>
              )}
              
              {onViewQR && (
                <Button
                  onClick={onViewQR}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Character Info */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              {character.description}
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50/80 text-xs text-gray-600">
              <span className="font-medium">Personality:</span>
              <span className="ml-1">{character.personality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-6 text-center space-y-3">
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-cyan-400 text-white text-xl font-bold">
                        {character.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800">Start a conversation with {character.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Say hello or ask a question to begin your chat!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className={message.sender === 'user' 
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold'
                      : 'bg-gradient-to-br from-purple-400 to-cyan-400 text-white font-semibold'
                    }>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : character.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl`}>
                    <Card className={`${message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' 
                      : 'bg-white/80 backdrop-blur-sm border-0'
                    }`}>
                      <CardContent className="p-3">
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          message.sender === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {message.message}
                        </p>
                      </CardContent>
                    </Card>
                    <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {sending && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-cyan-400 text-white font-semibold">
                    {character.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{character.name} is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${character.name}...`}
                  disabled={sending}
                  className="resize-none border-0 bg-gray-50/80 focus:bg-white transition-colors"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • {isDemoMode ? 'Demo mode - responses are simulated' : 'Powered by AI'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}