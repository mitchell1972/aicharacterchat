import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Character, ChatSession } from '../lib/supabase'
import { DataService } from '../services/dataService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { MessageCircle, Plus, Users, TestTube, LogOut, QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface DashboardProps {
  onViewQR?: () => void
}

export default function Dashboard({ onViewQR }: DashboardProps) {
  const { user, profile, signOut, isDemoMode, disableDemoMode } = useAuth()
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<Character[]>([])
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user, isDemoMode])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const dataService = DataService.getInstance()
      const characters = await dataService.getCharacters()
      const sessions = await dataService.getChatSessions(user.id)
      
      setCharacters(characters)
      setRecentSessions(sessions.slice(0, 3))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = (character: Character) => {
    navigate(`/chat/${character.id}`)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDisableDemoMode = () => {
    disableDemoMode()
    navigate('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mx-auto animate-pulse"></div>
          <p className="text-gray-600">Loading your characters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">AC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI Character Chat</h1>
                {isDemoMode && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                    <TestTube className="w-3 h-3 mr-1" />
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <div className="flex items-center space-x-2">
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
                
                {isDemoMode ? (
                  <Button
                    onClick={handleDisableDemoMode}
                    variant="outline"
                    size="sm"
                    className="text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    Exit Demo
                  </Button>
                ) : (
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! ✨
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our collection of unique AI personalities to start meaningful conversations.
            Each character has their own personality, interests, and conversation style.
          </p>
        </div>

        {/* Recent Chats */}
        {recentSessions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Recent Conversations</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => {
                const character = characters.find(c => c.id === session.character_id)
                return (
                  <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-white/60 backdrop-blur-sm"
                    onClick={() => character && handleStartChat(character)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-cyan-400 text-white text-sm font-semibold">
                            {character?.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{session.title}</p>
                          <p className="text-sm text-gray-500">with {character?.name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Characters Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">AI Characters</h3>
            </div>
            <Badge variant="outline" className="text-gray-600">
              {characters.length} available
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Card key={character.id} className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-cyan-400 text-white text-lg font-bold">
                        {character.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{character.name}</CardTitle>
                      <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                        AI Personality
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-600 line-clamp-3">
                    {character.description}
                  </CardDescription>
                  
                  <div className="bg-gray-50/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Personality Traits:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{character.personality}</p>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartChat(character)}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 group-hover:shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            {isDemoMode ? (
              'Demo mode - All conversations are temporary and stored locally'
            ) : (
              'Your conversations are securely stored and can be accessed anytime'
            )}
          </p>
        </div>
      </main>
    </div>
  )
}